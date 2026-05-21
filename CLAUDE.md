# Maddad — Claude Code Context

## Project overview

Transparency-first Islamic charitable giving SPA. Ontario, Canada.
React 18 + TypeScript + Vite. Supabase (Postgres, Auth, Storage). Stripe. Tailwind + shadcn/ui.

## Key rules (never violate)

- Secret keys (Stripe secret, Resend) only in Supabase Edge Function secrets — never in VITE_ variables.
- Every Stripe webhook must verify the signature before any processing.
- Zakat and Sadaqah funds must never be mixed in any query, transaction, or display.
- Do not change any existing UI component visually — only swap data sources.
- Do not use raw hex colors. Only HSL semantic tokens from index.css.
- All personal donation history and verification routes must be protected by Supabase Auth session checks.
- PIPEDA compliance: users must be able to request data deletion; collect only what is necessary.
- TypeScript strict — no `any` types, no `@ts-ignore`.
- RLS policy required for every table before writing any query against it.
- Never read auth state from localStorage directly — always use `supabase.getSession()` / `onAuthStateChange`.
- Never use deprecated Supabase v1 methods (`session()`, `user()` as properties).
- The donors row INSERT on signup must handle failure without leaving a dangling auth user.

## Architecture notes

- `useAuth()` from `@/hooks/useAuth` — exposes `user`, `session`, `role`, `isLoading`. Never reads localStorage directly.
- `DonorRole = 'donor' | 'charity_admin' | 'verifier' | 'platform_admin'`
- `verification_status` DB enum: `'draft'|'submitted'|'under_review'|'approved'|'rejected'` — `'approved'` is the DB value; `'verified'` is display-only.
- GivingType DB enum uses underscores: `sadaqah_jariyah`, `meal_sponsorship`.
- Hook cancellation pattern: `let cancelled = false` + `return () => { cancelled = true }` in useEffect.
- Functional updaters for state: avoids stale closures in React 18 batching.
- `as unknown as` casts for Supabase join types (no Relationships defined in the Database type).
- CAD Stripe rate: 2.9% + $0.30. Platform fee: 3% of base donation.
- Coverage items and map pins require lat/lng to be populated on the org/campaign record.

## Current state (as of Step 10 completion)

### What is built and working

- Full Supabase schema (5 migrations, 15 tables, RLS on all)
- Supabase Auth wired to /login and /signup
- All mocked data replaced with real Supabase queries
- Stripe Payment Element in DonationModule (one-time donations)
- Three Edge Functions: create-payment-intent, stripe-webhook, send-receipt
- Verification forms (org + campaign) submit to Supabase with evidence items + media
- Verifier dashboard at /verifier (verifier + platform_admin roles)
- Admin panel at /admin (platform_admin role only) — 4 tabs: submissions queue, orgs, campaigns, donations
- Verification email notifications via Resend (send-verification-email edge function)
- vercel.json SPA routing configured
- DEPLOYMENT.md checklist ready

### What is intentionally deferred (Phase 2)

- Stripe Subscriptions for recurring donations
  (currently uses Payment Intents with frequency in metadata — see TODO in useRecurringDonationCheckout.ts)
- Stripe Connect for direct org payouts
  (schema columns exist: stripe_connect_account_id on organizations)
- PDF receipt generation
  (receipts sent as HTML email; pdf_storage_path column exists but is never populated)
- PayPal as second payment gateway
- PostHog analytics events
- Charity self-service portal (charity_admin managing their own org)
- org_admins junction table for multi-user org teams
- PIPEDA data deletion flow in /my-giving (column exists: data_deletion_requested_at)
- Cookie consent banner
- update_subscriptions wiring (UpdatesSubscriptionDialog still writes to localStorage)

### Before going live — must do manually

See DEPLOYMENT.md for the full checklist. Key items:

- Run all 5 migrations in Supabase SQL editor in order
- Create 2 storage buckets: `evidence-docs` (private) and `campaign-media` (public)
- Deploy edge functions: `supabase functions deploy --all`
- Set edge function secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY
- Register Stripe webhook endpoint with the correct events
- Verify maddad.ca domain in Resend
- Set Vercel environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLISHABLE_KEY, VITE_MAPBOX_TOKEN)

### First platform_admin account

After deploying, sign up normally at /signup. Then run in Supabase SQL editor:

```sql
UPDATE donors SET role = 'platform_admin' WHERE email = 'your@email.com';
```

### Known deferred UI issues

- `Need.coverageItems` returns `[]` for DB campaigns — coverage_items column exists, needs populating via admin
- MapItem.privacyLevel defaults to `'global_ok'` for all DB campaigns
- Organization map pins only show for orgs with lat/lng populated
- /my-giving shows empty state until first real donation completes
- `src/types/receipt.ts` contains dead localStorage functions (saveReceipt, getReceipts) — the DonationReceipt type is still used but the storage functions are no longer called; safe to remove in a future cleanup
- `src/pages/Verification.tsx` has a "Verifier Mode" localStorage toggle — this is a UI preference, not data storage; acceptable but vestigial now that /verifier is properly role-gated
