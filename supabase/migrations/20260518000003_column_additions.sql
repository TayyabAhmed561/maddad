-- ── Column additions ──────────────────────────────────────────────────────────
-- Adds columns that the query layer expects but were absent from the initial schema.
-- All additions use IF NOT EXISTS so the migration is idempotent.

-- Fix 2: coverage_items — JSONB array of { label, amount, percentage } objects.
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS coverage_items jsonb NOT NULL DEFAULT '[]';

-- Fix 4: verifier_display_name — display name of the verifier who approved the evidence.
ALTER TABLE public.evidence_items
  ADD COLUMN IF NOT EXISTS verifier_display_name text;

-- Fix 5: privacy_level — controls whether a campaign pin is shown globally.
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS privacy_level text NOT NULL DEFAULT 'global_ok'
    CHECK (privacy_level IN ('global_ok', 'local_private', 'region_only'));

-- Fix 6: lat/lng on organizations — enables org pins on the map.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS lat numeric(9,6);

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS lng numeric(9,6);
