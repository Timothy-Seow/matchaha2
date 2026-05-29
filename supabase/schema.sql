-- matcha-haha — Supabase schema + RLS
-- Run this once in Supabase SQL Editor (or via `supabase db push` if using the CLI).

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  phone           text,
  loyalty_points  integer not null default 0,
  created_at      timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. PRODUCTS  (public read; admin write)
-- ============================================================
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  origin          text,
  tier            text check (tier in ('ceremonial','premium','latte','daily','ready','merch')),
  price_cents     integer not null,
  tasting_notes   text,
  description     text,
  stripe_price_id text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- 3. ORDERS + ORDER_ITEMS
-- ============================================================
create table public.orders (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  status                 text not null default 'paid' check (status in ('paid','shipped','delivered','refunded')),
  total_cents            integer not null,
  stripe_payment_intent  text,
  created_at             timestamptz not null default now()
);

create table public.order_items (
  id                       uuid primary key default gen_random_uuid(),
  order_id                 uuid not null references public.orders(id) on delete cascade,
  product_id               uuid not null references public.products(id),
  quantity                 integer not null check (quantity > 0),
  price_cents_at_purchase  integer not null
);

-- ============================================================
-- 4. SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id  text unique,
  tier                    text not null check (tier in ('signature','whiskers')),
  status                  text not null default 'active' check (status in ('active','paused','cancelled')),
  next_ship_date          date,
  created_at              timestamptz not null default now()
);

-- ============================================================
-- 5. FAVOURITES
-- ============================================================
create table public.favourites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ============================================================
-- RLS — enable on every table
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.subscriptions enable row level security;
alter table public.favourites    enable row level security;

-- profiles: user can read/update their own row
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- products: world-readable, no write
create policy "products read all" on public.products for select using (true);

-- orders: user reads own
create policy "own orders read" on public.orders for select using (auth.uid() = user_id);

-- order_items: user reads items belonging to their orders
create policy "own order_items read" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);

-- subscriptions: user reads own
create policy "own subscription read" on public.subscriptions for select using (auth.uid() = user_id);

-- favourites: user reads / inserts / deletes their own
create policy "own favs read"   on public.favourites for select using (auth.uid() = user_id);
create policy "own favs insert" on public.favourites for insert with check (auth.uid() = user_id);
create policy "own favs delete" on public.favourites for delete using (auth.uid() = user_id);

-- NOTE: orders / order_items / subscriptions / loyalty_points are written
-- exclusively by the Stripe webhook Edge Function using the service-role key,
-- which bypasses RLS. No insert/update policies are defined here on purpose.

-- ============================================================
-- 6. SEED PRODUCTS  (from shop.html — adjust price_cents / stripe_price_id later)
-- ============================================================
insert into public.products (slug, name, origin, tier, price_cents, tasting_notes, description) values
  ('kotobuki',  'Kotobuki 寿', 'Uji, Kyoto',     'ceremonial', 4800, 'Sweet pea, marzipan, white blossom',  'Our flagship ceremonial grade. Bright, lingering umami with a soft, almost dessert-like finish.'),
  ('hikari',    'Hikari 光',   'Nishio, Aichi',  'ceremonial', 4200, 'Steamed greens, cashew, honey',       'Buttery body with a clean, low-astringency finish.'),
  ('asa',       'Asa 朝',      'Yame, Fukuoka',  'premium',    3400, 'Snap pea, brown butter, citrus zest', 'A morning-forward blend. Punchy enough to wake the room.'),
  ('tsuki',     'Tsuki 月',    'Wazuka, Kyoto',  'premium',    5600, 'Wet stone, mint, dark chocolate',     'A contemplative single origin from a fourth-generation farm.'),
  ('hare',      'Hare 晴',     'Kagoshima',      'latte',      2800, 'Toasted oat, vanilla, banana leaf',   'Built for milk. Holds its colour through any oat, almond, or full-fat curveball.'),
  ('niko',      'Niko ニコ',   'Shizuoka',       'daily',      2200, 'Spinach, almond skin, lemon peel',    'An honest, everyday matcha.'),
  ('yuki',      'Yuki 雪',     'Uji, Kyoto',     'ceremonial', 6400, 'Sugar snap, nori, lily',              'A winter-harvest reserve.'),
  ('mori',      'Mori 森',     'Yame, Fukuoka',  'premium',    3800, 'Forest floor, pistachio, jasmine',    'Earthy and aromatic.'),
  ('pon',       'Pon ポン',    'Kagoshima',      'daily',      2000, 'Edamame, lime peel, toast',           'The friendly weekday matcha.')
on conflict (slug) do nothing;
