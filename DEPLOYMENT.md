# Maddad Platform — Deployment Checklist

## Prerequisites

- Supabase project created (free tier is fine for launch)
- Stripe account (test mode first, then live)
- Resend account with verified domain `maddad.ca`
- Vercel account linked to this repository
- Mapbox account with a public token

---

## 1 — Supabase

### 1.1 Run migrations

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

Migrations to apply (in order):
- `20260518000001_initial_schema.sql`
- `20260518000002_stripe_connect.sql`
- `20260518000004_receipt_email_sent.sql`
- `20260519000001_verifier_submission_update.sql`

### 1.2 Create Storage buckets

In **Supabase Dashboard → Storage**, create two buckets:

| Bucket name     | Public? | Purpose                          |
|-----------------|---------|----------------------------------|
| `evidence-docs` | No      | Private verification documents   |
| `campaign-media`| Yes     | Campaign cover images            |

### 1.3 Deploy Edge Functions

```bash
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
supabase functions deploy send-receipt
supabase functions deploy send-verification-email
```

### 1.4 Set Edge Function secrets

In **Supabase Dashboard → Edge Functions → Manage secrets** (or via CLI):

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set RESEND_API_KEY=re_...
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.

### 1.5 Create first platform_admin user

After deploying, sign up via the UI, then in **Supabase Dashboard → Table Editor → donors**,
update your row to `role = 'platform_admin'`.

---

## 2 — Stripe

### 2.1 Create webhook endpoint

In **Stripe Dashboard → Developers → Webhooks → Add endpoint**:

- URL: `https://<your-supabase-project>.supabase.co/functions/v1/stripe-webhook`
- Events to listen for:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Copy the **Signing secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET`.

### 2.2 Note Stripe fees

Platform uses CAD. Domestic Stripe rate: **2.9% + $0.30** per transaction.
Platform fee: **3% of base donation** (recorded in `platform_fee_amount`).

---

## 3 — Resend

### 3.1 Verify sending domain

In **Resend Dashboard → Domains**, add and verify `maddad.ca`.

Emails sent from:
- `receipts@maddad.ca` — donation receipts
- `verify@maddad.ca` — verification status updates

### 3.2 Set API key

Add `RESEND_API_KEY` to Supabase Edge Function secrets (see step 1.4).

---

## 4 — Vercel

### 4.1 Import repository

In **Vercel Dashboard → Add New Project**, import this repository.

### 4.2 Set environment variables

| Variable                    | Value                                    |
|-----------------------------|------------------------------------------|
| `VITE_SUPABASE_URL`         | Your Supabase project URL                |
| `VITE_SUPABASE_ANON_KEY`    | Your Supabase anon (public) key          |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...`) |
| `VITE_MAPBOX_TOKEN`         | Your Mapbox public token                 |
| `VITE_POSTHOG_KEY`          | PostHog project API key (optional)       |

### 4.3 Build settings

Vercel auto-detects Vite. No extra configuration needed.
`vercel.json` already contains the SPA rewrite rule.

---

## 5 — Post-deploy smoke tests

Run these after deploying to production:

- [ ] Load `/` — home page renders without errors
- [ ] Load `/explore` — map renders with campaigns
- [ ] Sign up as a new donor — donors row created, role = 'donor'
- [ ] Make a test donation (use Stripe test card `4242 4242 4242 4242`)
  - [ ] Payment succeeds in Stripe dashboard
  - [ ] `donations` row status changes to `succeeded`
  - [ ] `receipts` row created with serial number
  - [ ] Receipt email arrives (check `email_sent_at` in DB)
- [ ] Submit an org verification form — row appears in `verification_submissions`
- [ ] Log in as platform_admin, visit `/admin` — submissions queue visible
- [ ] Approve a submission — org/campaign `verification_status` changes to `approved`
- [ ] Verification status email arrives in submitter's inbox
- [ ] Visit `/verifier` as verifier role — queue visible, actions work

---

## 6 — Going live checklist

- [ ] Switch Stripe keys from `sk_test_` / `pk_test_` to `sk_live_` / `pk_live_`
- [ ] Update `STRIPE_WEBHOOK_SECRET` with the live webhook signing secret
- [ ] Confirm Resend domain is verified (not in sandbox mode)
- [ ] Enable Supabase email confirmations for production auth
- [ ] Set up Supabase backups (Dashboard → Database → Backups)
- [ ] Review and tighten Supabase RLS policies if needed
- [ ] Remove any test/seed data from the database
