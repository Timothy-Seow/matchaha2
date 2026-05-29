# matcha-haha — project context

> **Before doing anything else: read the most recent file in `changelog/` to see what was done last and what state the project is in.** Changelog entries are dated `YYYY-MM-DD.md`. Add a new entry (or append to today's) whenever you make a meaningful change.

## What this is

A static e-commerce site for a matcha tea brand. HTML + CSS + vanilla JS, no build step. Served locally via `python -m http.server 8000`. Backend is Supabase (auth + Postgres). Stripe will be wired in later for subscriptions.

## Stack & layout

- **Frontend:** plain HTML/CSS/JS, ES modules loaded directly from `js/`. No bundler, no framework.
- **Backend:** Supabase project `qschgqucwolhhkplvcld` (URL + anon key already pasted into `js/supabase-client.js`).
- **Pages:** `index.html`, `shop.html`, `about.html`, `subscriptions.html`, `signin.html`, `signup.html`, `account.html`.
- **JS modules:** `auth.js` (sign in/up/out), `account.js` (dashboard), `header.js` (nav + auth state), `script.js` (site-wide), `supabase-client.js` (shared client).
- **DB schema:** `supabase/schema.sql` (six tables: profiles, products, orders, order_items, subscriptions, favourites + RLS + seed products).

## Where things stand (phases)

Work is split into three phases — see `SETUP.md` for full setup instructions.

- **Phase 1 — auth + account shell:** code is written. Sign in / sign up / sign out, account dashboard with empty Orders / Subscription / Favourites / Loyalty tabs.
- **Phase 2 — Stripe (not started):** Stripe Checkout for subscriptions, Customer Portal for "Manage subscription", `stripe-webhook` Supabase Edge Function that writes orders and updates loyalty points.
- **Phase 3 — extras (not started):** "Heart" favourite button on product cards, Apple Sign-In, password reset page.

The original plan lives at `~/.claude/plans/how-about-sign-in-nested-nest.md`.

## Supabase MCP

The `supabase` MCP server is configured in `~/.claude.json` against project ref `qschgqucwolhhkplvcld`. Use it for `list_tables`, `apply_migration`, `execute_sql`, `get_logs`, `get_advisors`, etc.

- If migrations fail with "Cannot apply migration in read-only mode", the `--read-only` flag is still in the MCP args. Removing it requires editing `~/.claude.json` and **fully restarting Claude Code** for the new args to take effect — the running MCP process keeps the old flags.
- Prefer `list_tables` + `get_advisors` before making schema changes.

## Working conventions

- **Always check `changelog/` first.** The latest file there is the source of truth for what was done last and what's pending.
- **Update the changelog when you finish a unit of work.** One file per day (`changelog/YYYY-MM-DD.md`); append new entries to today's file rather than creating multiples.
- Singapore context — user is in SG, prices are likely SGD, region for Supabase is `ap-southeast-1`.
- No build step: just edit files and refresh the browser. To test, run `python -m http.server 8000` from the project root.
