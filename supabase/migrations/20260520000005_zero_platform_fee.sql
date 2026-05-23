-- Zero out platform fee — Maddad revenue is now entirely from optional donor tips

UPDATE campaign_payout_splits
SET organization_share_percent = 100, platform_fee_percent = 0;

ALTER TABLE campaign_payout_splits
ALTER COLUMN organization_share_percent SET DEFAULT 100.00;

ALTER TABLE campaign_payout_splits
ALTER COLUMN platform_fee_percent SET DEFAULT 0.00;

-- Waitlist for Maddad Pro early access
CREATE TABLE IF NOT EXISTS maddad_waitlist (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL UNIQUE,
  source     text        NOT NULL DEFAULT 'support-page',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE maddad_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can join waitlist"
  ON maddad_waitlist FOR INSERT
  WITH CHECK (true);
