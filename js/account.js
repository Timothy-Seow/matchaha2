// matcha-haha — account dashboard
import { supabase } from './supabase-client.js';
import { requireAuth, getCurrentProfile, signOut } from './auth.js';

const $ = (sel) => document.querySelector(sel);

function fmt(cents) { return 'S$' + (cents / 100).toFixed(2); }

async function loadProfile() {
  const p = await getCurrentProfile();
  if (!p) return;
  $('#profile-name').textContent  = p.full_name || '(no name)';
  $('#profile-email').textContent = p.email;
  $('#profile-phone').textContent = p.phone || '—';
  $('#loyalty-points').textContent = String(p.loyalty_points ?? 0);
}

async function loadOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, total_cents, created_at')
    .order('created_at', { ascending: false });
  const root = $('#orders-list');
  if (error || !data?.length) {
    root.innerHTML = `<p class="muted">No orders yet. <a href="shop.html">Shop matcha →</a></p>`;
    return;
  }
  root.innerHTML = data.map(o => `
    <div class="order-row">
      <div>
        <p class="order-id">#${o.id.slice(0, 8)}</p>
        <p class="muted">${new Date(o.created_at).toLocaleDateString()}</p>
      </div>
      <div class="order-status">${o.status}</div>
      <div class="order-total">${fmt(o.total_cents)}</div>
    </div>
  `).join('');
}

async function loadSubscriptions() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, tier, status, next_ship_date');
  const root = $('#subscriptions-list');
  if (error || !data?.length) {
    root.innerHTML = `<p class="muted">No active subscription. <a href="shop.html">Start one →</a></p>`;
    return;
  }
  root.innerHTML = data.map(s => `
    <div class="sub-row">
      <div>
        <h4>${s.tier === 'signature' ? 'Signature Whisk' : "Whisker's Pick"}</h4>
        <p class="muted">Status: ${s.status} · Next ship: ${s.next_ship_date ?? '—'}</p>
      </div>
      <a href="#" class="btn btn-ghost manage-sub" data-id="${s.id}">Manage</a>
    </div>
  `).join('');
}

async function loadFavourites() {
  const { data, error } = await supabase
    .from('favourites')
    .select('product_id, products(name, origin, price_cents, slug)')
    .order('created_at', { ascending: false });
  const root = $('#favourites-list');
  if (error || !data?.length) {
    root.innerHTML = `<p class="muted">No favourites yet. <a href="shop.html">Browse the shop →</a></p>`;
    return;
  }
  root.innerHTML = data.map(f => `
    <div class="fav-row">
      <div>
        <p class="order-id">${f.products.name}</p>
        <p class="muted">${f.products.origin}</p>
      </div>
      <div class="order-total">${fmt(f.products.price_cents)}</div>
    </div>
  `).join('');
}

// Tabs
function initTabs() {
  document.querySelectorAll('.account-tabs a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      document.querySelectorAll('.account-tabs a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      document.querySelectorAll('.account-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(id)?.classList.add('active');
      history.replaceState(null, '', `#${id}`);
    });
  });
  const hash = location.hash.slice(1);
  if (hash) document.querySelector(`.account-tabs a[href="#${hash}"]`)?.click();
}

(async () => {
  const user = await requireAuth({ next: 'account.html' });
  if (!user) return;
  initTabs();
  await Promise.all([loadProfile(), loadOrders(), loadSubscriptions(), loadFavourites()]);

  $('#signout-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut();
    location.href = 'index.html';
  });
})();
