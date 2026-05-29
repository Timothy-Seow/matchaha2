# matcha-haha — Auth Setup

The site is now wired for Supabase auth, but won't work until you plug in your project. Here's the shortest path.

## 1. Create a Supabase project (5 min)

1. Go to https://supabase.com and sign up (free).
2. **New Project** → name it `matcha-haha`, pick a region close to Singapore (e.g. `ap-southeast-1`).
3. Wait ~2 min for it to provision.

## 2. Run the schema

1. In your Supabase dashboard: **SQL Editor → New query**.
2. Open `supabase/schema.sql` in this folder and paste its contents.
3. Click **Run**. You should see all six tables in **Database → Tables**.

## 3. Paste your keys

1. Dashboard: **Settings → API**.
2. Copy **Project URL** and **anon public key**.
3. Open `js/supabase-client.js` and replace:
   - `YOUR_PROJECT_REF.supabase.co` → your Project URL
   - `YOUR_PUBLIC_ANON_KEY` → your anon key

That's enough to make **email/password sign-up and sign-in work**. Try it.

## 4. Email confirmation (optional, recommended for production)

- By default, Supabase requires email confirmation. For local testing, you can disable this:
  - **Authentication → Providers → Email** → toggle off **Confirm email**.
- For production, leave it on, and customize the email template under **Authentication → Email Templates**.

## 5. Google OAuth (10 min)

1. Go to https://console.cloud.google.com → create a project.
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
3. Application type: **Web application**. Authorized redirect URIs:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Copy the Client ID and Client Secret.
5. In Supabase: **Authentication → Providers → Google** → paste them → Enable.
6. The Google button on signin/signup now works.

## 6. Apple Sign-In (later)

Apple Sign-In requires a paid Apple Developer account ($99/year). Skip this for now and ship with Google. When you're ready:
- Follow Supabase's guide: https://supabase.com/docs/guides/auth/social-login/auth-apple
- Hide the Apple button by removing it from `signin.html` and `signup.html` until then.

## 7. Test it

1. Run the local server (still running, or restart with `python -m http.server 8000`).
2. Open http://localhost:8000
3. Click **Sign In** → **Create an account** → register with a real email.
4. After confirming (or if disabled), you land on `account.html` with your name in the header.

## 8. What's NOT done yet (Phases 2 & 3)

The plan in `~/.claude/plans/how-about-sign-in-nested-nest.md` splits work into three phases.

**Phase 1 (this commit):**
- Sign in / sign up / sign out
- Account dashboard with empty Orders / Subscription / Favourites / Loyalty tabs

**Phase 2 (not done):**
- Stripe Checkout for subscriptions
- Stripe Customer Portal for "Manage subscription"
- `stripe-webhook` Supabase Edge Function that creates orders and updates loyalty points

**Phase 3 (not done):**
- "Heart" button on product cards (favourites)
- Apple Sign-In
- Password reset page

When you're ready for Phase 2, ping me — it needs a Stripe account, a few `price` IDs created, and the Edge Function deployed via Supabase CLI.
