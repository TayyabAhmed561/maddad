# Supabase — Setup & Development Guide

## Prerequisites

- Supabase project created at [supabase.com](https://supabase.com)
- `supabase` CLI installed (`npm install -g supabase` or via Homebrew)
- `.env.local` file populated (see [Environment variables](#environment-variables))

---

## Running the migration

The schema lives in a single versioned migration file:

```
supabase/migrations/20260518000001_initial_schema.sql
```

**Option A — Supabase Dashboard (recommended for first run)**

1. Open your project → SQL Editor
2. Paste the full contents of the migration file
3. Click **Run**

**Option B — CLI (linked project)**

```bash
supabase db push
```

This applies all pending migrations in `supabase/migrations/` in order.

---

## Running the seed

The seed file inserts 6 organizations, 12 campaigns, campaign updates, evidence items, and
verification submissions. It does **not** insert any financial data (donations, receipts).

**Option A — Supabase Dashboard**

1. Open your project → SQL Editor
2. Paste the full contents of `supabase/seed.sql`
3. Click **Run**

The seed is idempotent (`ON CONFLICT ... DO NOTHING`), so it is safe to run more than once.

**Option B — CLI**

```bash
supabase db seed
```

> Run the migration first. The seed references tables created by the migration.

---

## Environment variables

### Client (Vite / browser)

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → `anon` `public` key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys → Publishable key |
| `VITE_MAPBOX_TOKEN` | Mapbox account → Tokens |
| `VITE_POSTHOG_KEY` | PostHog project settings → Project API Key |

### Edge Function secrets (server-side only)

Set these via the Supabase Dashboard → Edge Functions → Manage secrets, **never** in `VITE_` variables:

| Secret | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (starts with `whsec_`) |
| `RESEND_API_KEY` | Resend API key for transactional email |

---

## Reset and re-seed during development

To wipe all data and re-seed from scratch:

```sql
-- Run in Supabase SQL Editor — DESTRUCTIVE, dev only
TRUNCATE verification_submissions, evidence_items, campaign_updates,
         campaigns, organizations RESTART IDENTITY CASCADE;
```

Then re-run the seed file as above.

> If you also need to reset the schema, use the Dashboard → SQL Editor → reset, or run
> `supabase db reset` locally (linked project with local Postgres via Docker).

---

## Applying new migrations

Each schema change should be a new numbered migration file:

```
supabase/migrations/20260518000002_add_some_feature.sql
```

Then:

```bash
supabase db push        # pushes to remote linked project
# or paste in SQL Editor for quick iteration
```

---

## Auth configuration (Supabase Dashboard)

After running the migration, configure the following in your Supabase project:

- **Authentication → Providers → Email**: Enable email/password sign-in
- **Authentication → URL Configuration → Site URL**: Set to your Vercel/local URL
- **Authentication → URL Configuration → Redirect URLs**: Add `<your-domain>/auth/callback`
- **Authentication → Email Templates**: Customise the confirmation email if desired
