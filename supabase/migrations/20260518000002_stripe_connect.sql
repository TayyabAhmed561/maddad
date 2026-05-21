-- ── Stripe Connect columns on organizations ──────────────────────────────────
-- Stores Stripe Connect account details for future direct-to-organization payouts.
-- For launch, all donations settle to the Maddad platform account;
-- these columns are reserved for Phase 2 Connect integration.

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id     text        UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_connect_onboarding_complete  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_connect_charges_enabled      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_connect_payouts_enabled      boolean NOT NULL DEFAULT false;

-- ── Payout destination on campaigns ──────────────────────────────────────────
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS payout_destination text NOT NULL DEFAULT 'platform'
    CHECK (payout_destination IN ('platform', 'organization', 'individual'));

-- ── campaign_payout_splits ────────────────────────────────────────────────────
-- Defines the fee split for each campaign. Defaults to 97/3 (org/platform).
CREATE TABLE IF NOT EXISTS public.campaign_payout_splits (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id               uuid        NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  organization_share_percent numeric(5,2) NOT NULL DEFAULT 97.00,
  platform_fee_percent      numeric(5,2) NOT NULL DEFAULT 3.00,
  CONSTRAINT pct_sum_100
    CHECK (organization_share_percent + platform_fee_percent = 100.00),
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

-- One split row per campaign
CREATE UNIQUE INDEX IF NOT EXISTS campaign_payout_splits_campaign_id_key
  ON public.campaign_payout_splits (campaign_id);

-- ── RLS on campaign_payout_splits ─────────────────────────────────────────────
ALTER TABLE public.campaign_payout_splits ENABLE ROW LEVEL SECURITY;

-- Public can read splits for approved/verified campaigns
CREATE POLICY "Public read splits for approved campaigns"
  ON public.campaign_payout_splits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id
        AND c.verification_status = 'approved'
        AND c.is_active = true
        AND c.deleted_at IS NULL
    )
  );

-- platform_admin has full access
CREATE POLICY "Platform admin full access to payout splits"
  ON public.campaign_payout_splits
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.donors d
      WHERE d.id = auth.uid()
        AND d.role = 'platform_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.donors d
      WHERE d.id = auth.uid()
        AND d.role = 'platform_admin'
    )
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER campaign_payout_splits_updated_at
  BEFORE UPDATE ON public.campaign_payout_splits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
