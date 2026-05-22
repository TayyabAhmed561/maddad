-- ── Scheduled Donations ──────────────────────────────────────────────────────
-- Stores donation intents that should be processed on a specific future date.
-- Used by seasonal giving features (Dhul Hijjah 10-day plan, Ramadan nights).
--
-- Phase 2: A Supabase Edge Function or cron job will pick up rows where
-- status = 'scheduled' AND scheduled_date <= today, create a Stripe Payment
-- Intent for each, and update status to 'processing' → 'completed'/'failed'.

CREATE TABLE IF NOT EXISTS scheduled_donations (
  id                       uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id                 uuid          NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  campaign_id              uuid          REFERENCES campaigns(id) ON DELETE SET NULL,
  giving_type              giving_type   NOT NULL,
  amount                   numeric(12,2) NOT NULL CHECK (amount > 0),
  currency                 char(3)       NOT NULL DEFAULT 'CAD',
  scheduled_date           date          NOT NULL,
  status                   text          NOT NULL DEFAULT 'scheduled'
                             CHECK (status IN ('scheduled','processing','completed','failed','cancelled')),
  campaign_series          text          CHECK (campaign_series IN ('dhul_hijjah','ramadan','custom')),
  stripe_payment_intent_id text          UNIQUE,
  processed_at             timestamptz,
  created_at               timestamptz   NOT NULL DEFAULT now(),
  updated_at               timestamptz   NOT NULL DEFAULT now(),
  deleted_at               timestamptz
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_scheduled_donations_donor_id
  ON scheduled_donations(donor_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_donations_scheduled_date
  ON scheduled_donations(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_scheduled_donations_status
  ON scheduled_donations(status);

CREATE INDEX IF NOT EXISTS idx_scheduled_donations_campaign_series
  ON scheduled_donations(campaign_series);

-- ── updated_at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_scheduled_donations_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_scheduled_donations_updated_at
  BEFORE UPDATE ON scheduled_donations
  FOR EACH ROW EXECUTE FUNCTION update_scheduled_donations_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE scheduled_donations ENABLE ROW LEVEL SECURITY;

-- Donors: read their own rows
CREATE POLICY "scheduled_donations: donor select own"
  ON scheduled_donations FOR SELECT
  USING (donor_id = auth.uid());

-- Donors: insert their own rows
CREATE POLICY "scheduled_donations: donor insert own"
  ON scheduled_donations FOR INSERT
  WITH CHECK (donor_id = auth.uid());

-- Donors: update their own rows (e.g. cancel)
CREATE POLICY "scheduled_donations: donor update own"
  ON scheduled_donations FOR UPDATE
  USING  (donor_id = auth.uid())
  WITH CHECK (donor_id = auth.uid());

-- Platform admin: full access
CREATE POLICY "scheduled_donations: platform_admin full"
  ON scheduled_donations FOR ALL
  USING  (get_my_role() = 'platform_admin')
  WITH CHECK (get_my_role() = 'platform_admin');
