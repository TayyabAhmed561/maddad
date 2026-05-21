-- ============================================================
-- Maddad Platform — Initial Schema Migration
-- Version:     001
-- Date:        2026-05-18
-- Currency:    CAD throughout — no USD anywhere
-- Auth:        Supabase Auth (auth.users)
-- Storage:     Supabase Storage (urls stored in url/storage_path columns)
-- ============================================================
--
-- Table creation order:
--   Extensions → Enums → Utility functions → organizations →
--   campaigns → donors → donations → receipts →
--   recurring_donations → verification_submissions →
--   verification_decisions → evidence_items → evidence_media →
--   campaign_updates → campaign_update_media → supporter_messages →
--   update_subscriptions → donation_audit_log →
--   platform_stats view → Indexes → RLS → Grants
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 1. ENUMS
-- ============================================================

-- Canonical campaign category (derived from MapCategory — the most
-- complete set). UI maps: AppealCategory housing→shelter,
-- disaster→shelter or medical at seed time.
CREATE TYPE campaign_category AS ENUM (
  'food',
  'shelter',
  'medical',
  'education',
  'masjid',
  'fidya',
  'qurbani',
  'zakat'
);

-- Islamic giving type — required on every donation record.
-- Zakat ring-fencing enforced by trigger on donations table.
-- sadaqah = general charitable giving (default for non-typed campaigns).
-- meal_sponsorship uses underscore to match Postgres enum convention;
-- mapped to 'meal-sponsorship' in TypeScript at the query layer.
CREATE TYPE giving_type AS ENUM (
  'zakat',
  'fidya',
  'kaffarah',
  'qurbani',
  'sadaqah_jariyah',
  'meal_sponsorship',
  'sadaqah'
);

-- Campaign discriminator — single campaigns table for all types.
-- need            = organizational campaign run by a verified charity
-- appeal          = curated humanitarian appeal managed by platform
-- community_appeal = individual/family appeal endorsed by a masjid or org
CREATE TYPE campaign_type AS ENUM (
  'need',
  'appeal',
  'community_appeal'
);

-- Verification workflow for both organizations and campaigns.
-- Full state machine: draft → submitted → under_review → approved | rejected
-- UI displays 'approved' as the 'Verified' label — that is a display concern.
-- An org or campaign may cycle through this multiple times (resubmission).
CREATE TYPE verification_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected'
);

-- Evidence types (mirrors EvidenceType in src/types/verification.ts exactly).
CREATE TYPE evidence_type AS ENUM (
  -- Organization-level evidence
  'org_registration',
  'org_financial_audit',
  'org_board_resolution',
  'org_tax_status',
  -- Campaign-level evidence
  'campaign_need_photo',
  'campaign_need_video',
  'campaign_budget_breakdown',
  'campaign_endorsement_letter',
  'campaign_beneficiary_consent',
  -- Private campaign verification supports
  'campaign_referral_attestation',
  'campaign_document_proof',
  'campaign_budget_quote',
  'campaign_verifier_interview',
  -- Milestone / completion evidence
  'milestone_progress_photo',
  'milestone_progress_video',
  'milestone_receipt',
  'milestone_delivery_confirmation',
  'milestone_completion_report',
  'milestone_beneficiary_feedback'
);

-- Donation lifecycle states (mirrors Stripe payment lifecycle).
CREATE TYPE donation_status AS ENUM (
  'pending',      -- Created; awaiting Stripe confirmation
  'processing',   -- Stripe payment in flight
  'succeeded',    -- Payment confirmed via Stripe webhook
  'failed',       -- Payment failed
  'refunded',     -- Full or partial refund issued
  'disputed'      -- Stripe chargeback opened
);


-- ============================================================
-- UTILITY: auto-set updated_at on any UPDATE
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ============================================================
-- 2. ORGANIZATIONS
-- ============================================================
-- Represents Ontario-registered charities.
-- Every campaign of type 'need' or 'appeal' must belong to an organization.
-- Some organizations run overseas campaigns as Ontario-based intermediaries —
-- this is legally clean and requires no special schema handling.

CREATE TABLE organizations (
  id                                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Legal identity
  legal_name                           text NOT NULL,
  display_name                         text NOT NULL,

  -- URL-safe identifier used in /charity/:id routes
  slug                                 text UNIQUE NOT NULL,

  -- CRA Business Number (format: 123456789 RR 0001).
  -- Nullable for draft/submitted orgs; enforced NOT NULL before approval
  -- by trg_enforce_org_registration trigger below.
  -- Required on every CRA-compliant tax receipt.
  ontario_charity_registration_number  text,

  -- Public profile
  description                          text,
  website_url                          text,
  logo_url                             text,    -- Supabase Storage public URL

  -- Internal contact (not all fields shown publicly)
  contact_email                        text,
  contact_phone                        text,

  -- Verification & trust
  -- Composite trust score 0–100: verification completeness + financial
  -- clarity + project completion rate. Updated by platform admin or trigger.
  verification_status                  verification_status NOT NULL DEFAULT 'draft',
  trust_score                          integer CHECK (trust_score BETWEEN 0 AND 100),

  -- Ownership (the user who submitted the org for verification)
  created_by                           uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at                           timestamptz NOT NULL DEFAULT now(),
  updated_at                           timestamptz NOT NULL DEFAULT now(),
  deleted_at                           timestamptz   -- Soft delete; PIPEDA audit trail
);

COMMENT ON TABLE organizations
  IS 'Ontario-registered charities. All need/appeal campaigns belong to an organization.';
COMMENT ON COLUMN organizations.ontario_charity_registration_number
  IS 'CRA BN format: 123456789 RR 0001. Required for approved orgs and tax receipts. Nullable until approval.';
COMMENT ON COLUMN organizations.trust_score
  IS '0–100 composite score: verification completeness, financial clarity, project completion rate.';
COMMENT ON COLUMN organizations.deleted_at
  IS 'Soft delete. Non-null = deleted. Required for PIPEDA audit trail. Never hard-delete.';

-- Enforce: CRA registration number must be present before an org can be approved.
CREATE OR REPLACE FUNCTION enforce_org_registration_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.verification_status = 'approved'
     AND (NEW.ontario_charity_registration_number IS NULL
          OR trim(NEW.ontario_charity_registration_number) = '')
  THEN
    RAISE EXCEPTION
      'ontario_charity_registration_number is required before an organization can be approved. '
      'Provide the CRA Business Number (format: 123456789 RR 0001) first.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_org_registration
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION enforce_org_registration_on_approval();

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 3. CAMPAIGNS
-- ============================================================
-- Single source of truth for all fundraising entities.
-- campaign_type discriminates between org campaigns, curated appeals,
-- and community/individual appeals.
-- lat/lng + urgency + category drive the Mapbox map and heatmap.

CREATE TABLE campaigns (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Discriminator
  campaign_type        campaign_type NOT NULL DEFAULT 'need',

  -- Owning organization.
  -- Required for 'need' and 'appeal' types.
  -- Nullable for 'community_appeal' (endorsed by masjid, not a registered org).
  organization_id      uuid REFERENCES organizations(id) ON DELETE SET NULL,

  -- Identity
  title                text NOT NULL,
  slug                 text UNIQUE NOT NULL,
  description          text,
  cover_image_url      text,    -- Supabase Storage public URL

  -- Classification
  category             campaign_category NOT NULL,

  -- Islamic giving context.
  -- Set only for structured giving programs (e.g., the Zakat pool,
  -- Fidya program). NULL for standard fundraising campaigns.
  giving_type          giving_type,

  -- Zakat eligibility flag.
  -- When true, this campaign may receive Zakat donations.
  -- The trg_enforce_zakat_eligibility trigger on donations enforces
  -- that giving_type = 'zakat' donations only go to zakat_eligible campaigns.
  zakat_eligible       boolean NOT NULL DEFAULT false,

  -- Geography — drives Mapbox pin placement and heatmap
  location_label       text NOT NULL,
  lat                  numeric(9, 6),
  lng                  numeric(9, 6),
  country_code         char(2) NOT NULL DEFAULT 'CA',

  -- Urgency 1 (lowest) → 5 (highest/critical).
  -- Client-side mapping: 1–2 = low, 3 = medium, 4–5 = critical.
  -- Drives heatmap gradient opacity and pin colour.
  urgency              integer NOT NULL DEFAULT 3 CHECK (urgency BETWEEN 1 AND 5),

  -- Fundraising totals (CAD)
  goal_amount          numeric(12, 2),              -- NULL = open-ended goal
  raised_amount        numeric(12, 2) NOT NULL DEFAULT 0,  -- Kept in sync by trigger
  currency             char(3) NOT NULL DEFAULT 'CAD',

  -- Community appeal extra fields (used only when campaign_type = 'community_appeal')
  beneficiary_name     text,
  endorsed_by_name     text,
  endorsed_by_type     text CHECK (endorsed_by_type IN ('masjid', 'organization')),

  -- Verification
  verification_status  verification_status NOT NULL DEFAULT 'draft',

  -- Lifecycle
  is_active            boolean NOT NULL DEFAULT true,
  starts_at            timestamptz,
  ends_at              timestamptz,

  -- Ownership
  created_by           uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz
);

COMMENT ON TABLE campaigns
  IS 'Single table for all fundraising entities. campaign_type discriminates. '
     'lat/lng/urgency/category drive the Mapbox map.';
COMMENT ON COLUMN campaigns.urgency
  IS '1–5 integer. Client maps: 1–2=low, 3=medium, 4–5=critical. Drives heatmap opacity gradient.';
COMMENT ON COLUMN campaigns.raised_amount
  IS 'Denormalized CAD sum of succeeded donations. Kept in sync by trg_update_campaign_raised_amount trigger.';
COMMENT ON COLUMN campaigns.giving_type
  IS 'Set for structured Islamic giving programs only. NULL for standard campaigns.';
COMMENT ON COLUMN campaigns.zakat_eligible
  IS 'Must be true to receive Zakat donations. Enforced at DB level by trigger on donations.';

-- Trigger: keep raised_amount in sync with donations
CREATE OR REPLACE FUNCTION update_campaign_raised_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Add amount when a donation transitions to 'succeeded'
  IF (TG_OP = 'INSERT' AND NEW.status = 'succeeded')
     OR (TG_OP = 'UPDATE'
         AND NEW.status = 'succeeded'
         AND OLD.status <> 'succeeded')
  THEN
    UPDATE campaigns
    SET raised_amount = raised_amount + NEW.amount,
        updated_at    = now()
    WHERE id = NEW.campaign_id;

  -- Subtract amount when a succeeded donation is refunded
  ELSIF TG_OP = 'UPDATE'
        AND OLD.status = 'succeeded'
        AND NEW.status = 'refunded'
  THEN
    UPDATE campaigns
    SET raised_amount = GREATEST(0, raised_amount - NEW.amount),
        updated_at    = now()
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$;
-- Trigger installed after donations table (see § donations section)

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 4. DONORS (profiles)
-- ============================================================
-- Extends Supabase auth.users 1:1.
-- Stores CRA-required address, platform role, Stripe customer ID,
-- and PIPEDA consent / deletion request state.

CREATE TABLE donors (
  -- Mirrors auth.users primary key
  id                           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity
  full_name                    text,   -- Legal name; used on CRA tax receipts; never shown publicly
  display_name                 text,   -- Public-facing name on SupporterMessages walls

  -- Email mirrored from auth.users for fast lookups without JOIN
  email                        text NOT NULL,

  -- CRA-required address fields for tax receipt generation.
  -- Captured when donor first completes a donation.
  address_street               text,
  address_city                 text,
  address_province             text    DEFAULT 'ON',
  address_postal_code          text,
  address_country              text    DEFAULT 'CA',

  -- Platform role — used by all RLS policies.
  -- 'anonymous' access is handled at DB level (no auth.uid()); no row needed.
  -- charity_admin: admin of their own org (created_by FK); expand to
  --   org_admins junction table when multi-user org teams are needed.
  role                         text    NOT NULL DEFAULT 'donor'
                               CHECK (role IN ('donor', 'charity_admin', 'verifier', 'platform_admin')),

  -- Stripe (nullable until first donation)
  stripe_customer_id           text    UNIQUE,

  -- PIPEDA compliance
  marketing_consent            boolean NOT NULL DEFAULT false,
  -- Set by donor via /my-giving → "Delete my data" flow.
  -- Triggers anonymization workflow (name/address nulled; email hashed).
  data_deletion_requested_at   timestamptz,

  -- Timestamps
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now(),
  deleted_at                   timestamptz
);

COMMENT ON TABLE donors
  IS 'Extends auth.users. Stores CRA address, platform role, and Stripe customer ID.';
COMMENT ON COLUMN donors.full_name
  IS 'Legal name for CRA tax receipts. Never shown publicly. Captured on first donation.';
COMMENT ON COLUMN donors.display_name
  IS 'Shown on SupporterMessages walls. Defaults to "Anonymous" when is_anonymous=true on a donation.';
COMMENT ON COLUMN donors.role
  IS 'RLS role: donor (default) | charity_admin | verifier | platform_admin.';
COMMENT ON COLUMN donors.data_deletion_requested_at
  IS 'PIPEDA right-to-erasure trigger. Set by donor in /my-giving. Initiates anonymization workflow.';

CREATE TRIGGER trg_donors_updated_at
  BEFORE UPDATE ON donors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 5. DONATIONS
-- ============================================================
-- Every donation transaction, one-time and recurring.
-- giving_type is required on every row — no untyped donations.
-- Zakat ring-fencing enforced here at the DB level.
-- Soft-delete only — financial records must never be hard-deleted.

CREATE TABLE donations (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign context (required; cannot delete a campaign with donations)
  campaign_id              uuid NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,

  -- Donor (nullable for anonymous guest donations without an account;
  -- receipt is still generated internally using collected name/address)
  donor_id                 uuid REFERENCES donors(id) ON DELETE RESTRICT,

  -- Islamic giving classification — required on every row.
  -- Zakat ring-fencing: giving_type='zakat' requires campaign.zakat_eligible=true.
  -- Enforced by trg_enforce_zakat_eligibility trigger.
  giving_type              giving_type NOT NULL,

  -- Financial (CAD)
  amount                   numeric(12, 2) NOT NULL CHECK (amount > 0),
  currency                 char(3)        NOT NULL DEFAULT 'CAD',
  platform_fee_amount      numeric(12, 2) NOT NULL DEFAULT 0
                           CHECK (platform_fee_amount >= 0),
  -- Stored computed column: amount - platform_fee_amount
  net_amount               numeric(12, 2) GENERATED ALWAYS AS (amount - platform_fee_amount) STORED,

  -- Lifecycle
  status                   donation_status NOT NULL DEFAULT 'pending',

  -- Frequency
  frequency                text NOT NULL DEFAULT 'one-time'
                           CHECK (frequency IN ('one-time', 'weekly', 'monthly', 'yearly')),
  -- FK to recurring_donations added after that table is created
  recurring_donation_id    uuid,

  -- Donor preferences
  is_anonymous             boolean NOT NULL DEFAULT false,
  -- When true: shown as "Anonymous" on SupporterMessages wall.
  -- Receipt is still generated internally with real donor details.
  hide_amount              boolean NOT NULL DEFAULT false,
  -- Personal dua / intention text. Stored privately; never shown publicly.
  dua_intention            text,

  -- Stripe
  -- Unique Stripe Payment Intent ID. Used for webhook deduplication.
  stripe_payment_intent_id text UNIQUE,

  -- Timestamps
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  deleted_at               timestamptz
);

COMMENT ON TABLE donations
  IS 'Every donation transaction. giving_type required on every row. Soft-delete only.';
COMMENT ON COLUMN donations.giving_type
  IS 'Required. Zakat ring-fencing enforced by trigger: giving_type=zakat → campaign.zakat_eligible=true.';
COMMENT ON COLUMN donations.net_amount
  IS 'Computed and stored: amount - platform_fee_amount. Use for payout calculations.';
COMMENT ON COLUMN donations.stripe_payment_intent_id
  IS 'Stripe pi_xxxxx ID. Unique constraint prevents duplicate webhook processing.';
COMMENT ON COLUMN donations.is_anonymous
  IS 'When true, donor appears as "Anonymous" publicly. Receipt still generated with real details internally.';

-- ============================================================
-- ZAKAT RING-FENCING TRIGGER
-- DB-level enforcement: Zakat donations can only be directed to
-- campaigns with zakat_eligible = true.
-- This is a religious and legal requirement and cannot be bypassed
-- at the application layer. Any INSERT or UPDATE that would route
-- a Zakat donation to a non-eligible campaign will raise an exception.
-- ============================================================

CREATE OR REPLACE FUNCTION enforce_zakat_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.giving_type = 'zakat' THEN
    IF NOT EXISTS (
      SELECT 1 FROM campaigns
      WHERE id          = NEW.campaign_id
        AND zakat_eligible = true
        AND deleted_at  IS NULL
    ) THEN
      RAISE EXCEPTION
        'Zakat donation rejected: campaign % does not have zakat_eligible=true. '
        'Zakat funds cannot be mixed with sadaqah or general donations. '
        'This constraint is enforced at the database level.',
        NEW.campaign_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_zakat_eligibility
  BEFORE INSERT OR UPDATE OF giving_type, campaign_id ON donations
  FOR EACH ROW EXECUTE FUNCTION enforce_zakat_eligibility();

-- Trigger: keep campaigns.raised_amount current
CREATE TRIGGER trg_update_campaign_raised_amount
  AFTER INSERT OR UPDATE OF status, amount ON donations
  FOR EACH ROW EXECUTE FUNCTION update_campaign_raised_amount();

CREATE TRIGGER trg_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 6. RECEIPTS
-- ============================================================
-- CRA-compliant tax receipts. One per donation.
-- All fields required by the Income Tax Act for official charitable receipts.
-- Generated by Edge Function after Stripe webhook confirms payment_succeeded.

-- Sequence for unique receipt serial numbers.
-- Global sequence; year is embedded in the formatted string.
-- Format: MADDAD-YYYY-NNNNNN
CREATE SEQUENCE IF NOT EXISTS receipt_serial_seq
  START WITH 1 INCREMENT BY 1 NO CYCLE;

CREATE OR REPLACE FUNCTION generate_receipt_serial()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'MADDAD-'
    || to_char(now(), 'YYYY')
    || '-'
    || lpad(nextval('receipt_serial_seq')::text, 6, '0');
END;
$$;

CREATE TABLE receipts (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- One-to-one with donations; restrict prevents orphaned receipts
  donation_id               uuid NOT NULL UNIQUE REFERENCES donations(id) ON DELETE RESTRICT,

  -- CRA required: unique receipt identifier
  -- Auto-populated by trg_set_receipt_serial trigger below.
  receipt_serial_number     text NOT NULL UNIQUE,

  -- CRA required: issuing charity
  charity_legal_name        text NOT NULL,
  -- Format enforced by application layer: 123456789 RR 0001
  charity_registration_number text NOT NULL,

  -- CRA required: donor details (snapshot at receipt generation time)
  donor_full_name           text NOT NULL,
  -- Shape: { street, city, province, postal_code, country }
  -- Stored as JSONB snapshot; does not change if donor updates address later.
  donor_address             jsonb NOT NULL,

  -- CRA required: financial details (CAD)
  donation_amount           numeric(12, 2) NOT NULL,
  -- For a pure charitable donation: eligible_amount = donation_amount.
  -- If the donor received goods or services of value in return,
  -- eligible_amount = donation_amount − fair market value of those goods/services.
  eligible_amount_for_tax   numeric(12, 2) NOT NULL,
  currency                  char(3)        NOT NULL DEFAULT 'CAD',

  -- CRA required: date of gift
  donation_date             date NOT NULL,

  -- CRA required: certification statement
  -- "I certify that the information in this receipt is true, accurate, and complete."
  -- Populated by Edge Function with the issuing officer's name and title.
  digital_signature_text    text NOT NULL,

  -- Display flag (receipt is still generated; suppressed on public view)
  is_anonymous              boolean NOT NULL DEFAULT false,

  -- Generated PDF stored in Supabase Storage receipts/ bucket
  pdf_storage_path          text,    -- NULL until PDF is generated by Edge Function

  -- Timestamps (no deleted_at — receipts are permanent financial records)
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE receipts
  IS 'CRA-compliant tax receipts. One per donation. All Income Tax Act required fields present.';
COMMENT ON COLUMN receipts.receipt_serial_number
  IS 'Format: MADDAD-YYYY-NNNNNN. Auto-generated from receipt_serial_seq. Required by CRA.';
COMMENT ON COLUMN receipts.eligible_amount_for_tax
  IS 'Usually equals donation_amount. Reduced only if donor received goods/services of value in return.';
COMMENT ON COLUMN receipts.donor_address
  IS 'JSONB snapshot at time of receipt generation. Shape: {street, city, province, postal_code, country}.';
COMMENT ON COLUMN receipts.digital_signature_text
  IS 'CRA-required certification text. Include issuing officer name and title.';
COMMENT ON COLUMN receipts.pdf_storage_path
  IS 'Supabase Storage path (receipts/YYYY/MADDAD-YYYY-NNNNNN.pdf). NULL until generated.';

-- Auto-populate receipt_serial_number before INSERT
CREATE OR REPLACE FUNCTION set_receipt_serial()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.receipt_serial_number IS NULL OR trim(NEW.receipt_serial_number) = '' THEN
    NEW.receipt_serial_number := generate_receipt_serial();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_receipt_serial
  BEFORE INSERT ON receipts
  FOR EACH ROW EXECUTE FUNCTION set_receipt_serial();

CREATE TRIGGER trg_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 7. RECURRING DONATIONS
-- ============================================================
-- One row per active Stripe Subscription.
-- Stripe webhook events update status and next_billing_date.
-- Each billing cycle inserts a new row in donations referencing this record.

CREATE TABLE recurring_donations (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  donor_id               uuid NOT NULL REFERENCES donors(id) ON DELETE RESTRICT,
  campaign_id            uuid REFERENCES campaigns(id) ON DELETE SET NULL,

  -- Islamic giving classification (same enum as donations)
  giving_type            giving_type NOT NULL,

  -- Financial (CAD)
  amount                 numeric(12, 2) NOT NULL CHECK (amount > 0),
  currency               char(3)        NOT NULL DEFAULT 'CAD',
  frequency              text           NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),

  -- Subscription state
  status                 text NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'paused', 'cancelled')),

  -- Stripe references
  -- NULL until Stripe confirms subscription creation via webhook.
  stripe_subscription_id text UNIQUE,
  -- Mirrors donors.stripe_customer_id for webhook lookups without a JOIN.
  stripe_customer_id     text,

  next_billing_date      date,

  -- Timestamps
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  cancelled_at           timestamptz,    -- Set when status transitions to 'cancelled'
  deleted_at             timestamptz
);

COMMENT ON TABLE recurring_donations
  IS 'Stripe Subscription records. One row per active subscription. Each billing cycle adds a row to donations.';
COMMENT ON COLUMN recurring_donations.stripe_subscription_id
  IS 'Stripe sub_xxxxx ID. NULL until Stripe confirms. Unique to prevent duplicates.';
COMMENT ON COLUMN recurring_donations.stripe_customer_id
  IS 'Denormalized from donors.stripe_customer_id for fast webhook lookups.';

-- Wire FK from donations → recurring_donations now that the table exists
ALTER TABLE donations
  ADD CONSTRAINT fk_donations_recurring_donation
  FOREIGN KEY (recurring_donation_id)
  REFERENCES recurring_donations(id)
  ON DELETE SET NULL;

CREATE TRIGGER trg_recurring_donations_updated_at
  BEFORE UPDATE ON recurring_donations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 8. VERIFICATION SUBMISSIONS
-- ============================================================
-- Tracks each submission attempt in the verification workflow.
-- A single org or campaign may have multiple submissions over time
-- (submitted → rejected → resubmitted → approved).
-- Evidence items are linked here via evidence_items.submission_id.

CREATE TABLE verification_submissions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What is being submitted
  submission_type  text NOT NULL CHECK (submission_type IN ('organization', 'campaign')),

  -- Exactly one of these must be non-null (enforced by constraint below)
  organization_id  uuid REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id      uuid REFERENCES campaigns(id)     ON DELETE CASCADE,

  -- Current state in the workflow
  status           verification_status NOT NULL DEFAULT 'draft',

  -- Who submitted (the charity admin or donor submitting for verification)
  submitted_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Null until status transitions to 'submitted'
  submitted_at     timestamptz,

  -- Optional context note from the submitter to the verifier
  submitter_notes  text,

  -- Timestamps
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz,

  CONSTRAINT chk_submission_one_subject CHECK (
    (organization_id IS NOT NULL AND campaign_id IS NULL)
    OR (organization_id IS NULL  AND campaign_id IS NOT NULL)
  )
);

COMMENT ON TABLE verification_submissions
  IS 'One row per verification attempt. Multiple attempts allowed per org/campaign (resubmission after rejection).';
COMMENT ON CONSTRAINT chk_submission_one_subject ON verification_submissions
  IS 'Each submission must reference exactly one subject: either organization_id or campaign_id, not both.';
COMMENT ON COLUMN verification_submissions.submitted_at
  IS 'Set when status changes from draft → submitted. NULL while still in draft.';

CREATE TRIGGER trg_verification_submissions_updated_at
  BEFORE UPDATE ON verification_submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 9. VERIFICATION DECISIONS
-- ============================================================
-- Append-only audit trail of every verifier action on each submission.
-- A submission may accumulate multiple decisions across its lifecycle
-- (e.g., under_review → rejected → [resubmit] → approved).
-- No UPDATE or DELETE on this table. Ever.

CREATE TABLE verification_decisions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  submission_id  uuid NOT NULL REFERENCES verification_submissions(id) ON DELETE CASCADE,

  -- The verifier who made the decision
  decided_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- The decision (only states that a verifier can actively assign)
  decision       verification_status NOT NULL
                 CHECK (decision IN ('under_review', 'approved', 'rejected')),

  -- Shown to submitter on rejection; optional on approval
  notes          text,

  decided_at     timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now()
  -- No updated_at or deleted_at: append-only
);

COMMENT ON TABLE verification_decisions
  IS 'Append-only. Every verifier action recorded here. No UPDATE or DELETE permitted.';


-- ============================================================
-- 10. EVIDENCE ITEMS
-- ============================================================
-- Verification evidence attached to campaigns or organizations.
-- Media files are in evidence_media (separate table, not JSONB).
-- confidence_score drives EvidenceConfidenceIndicator in the UI.

CREATE TABLE evidence_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to verification workflow (nullable: evidence can exist
  -- independently of a formal submission, e.g., platform-added records)
  submission_id     uuid REFERENCES verification_submissions(id) ON DELETE SET NULL,

  -- Subject of the evidence (exactly one non-null; see constraint below)
  campaign_id       uuid REFERENCES campaigns(id)     ON DELETE CASCADE,
  organization_id   uuid REFERENCES organizations(id) ON DELETE CASCADE,

  -- Evidence classification
  evidence_type     evidence_type NOT NULL,
  title             text NOT NULL,
  description       text,

  -- Review state
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Drives EvidenceConfidenceIndicator in UI.
  -- Set by verifier. 50 = pending review, 100 = fully verified.
  confidence_score  integer NOT NULL DEFAULT 50
                    CHECK (confidence_score BETWEEN 0 AND 100),

  -- 'private' items visible only to verifiers and the submitting org
  visibility        text NOT NULL DEFAULT 'public'
                    CHECK (visibility IN ('public', 'private')),

  -- Date the evidence was gathered (not necessarily when uploaded)
  evidence_date     date,

  -- Who uploaded this evidence
  submitted_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz,

  CONSTRAINT chk_evidence_one_subject CHECK (
    (campaign_id IS NOT NULL AND organization_id IS NULL)
    OR (campaign_id IS NULL  AND organization_id IS NOT NULL)
    OR (campaign_id IS NULL  AND organization_id IS NULL)
    -- Third case: evidence linked only to a submission (pre-assignment)
  )
);

COMMENT ON TABLE evidence_items
  IS 'Verification evidence for campaigns and organizations. Media files are in evidence_media.';
COMMENT ON COLUMN evidence_items.confidence_score
  IS 'Set by verifier. Drives EvidenceConfidenceIndicator. 0=low confidence, 50=pending, 100=fully verified.';
COMMENT ON COLUMN evidence_items.visibility
  IS 'private items visible only to verifiers and the submitting org. public items shown on campaign/org detail pages.';

CREATE TRIGGER trg_evidence_items_updated_at
  BEFORE UPDATE ON evidence_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 11. EVIDENCE MEDIA
-- ============================================================
-- One or more media files per evidence item.
-- Replaces the single EvidenceMedia object in the TypeScript type with
-- a proper relation — cleaner to query, easier to add Supabase Storage URLs.

CREATE TABLE evidence_media (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  evidence_id    uuid NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,

  -- Storage
  url            text NOT NULL,     -- Public URL or Supabase signed URL
  storage_path   text,              -- Internal Supabase Storage path for management/deletion

  -- Classification (mirrors EvidenceMedia.kind in verification.ts)
  media_type     text NOT NULL CHECK (media_type IN ('image', 'video', 'pdf', 'link')),

  -- Display helpers
  thumbnail_url  text,    -- Pre-generated thumbnail for video/pdf preview
  caption        text,

  -- Display order within the evidence item
  sort_order     integer NOT NULL DEFAULT 0,

  created_at     timestamptz NOT NULL DEFAULT now()
  -- No updated_at or deleted_at: cascade from evidence_items
);

COMMENT ON TABLE evidence_media
  IS 'Media attachments for evidence items. One or many per item. Cascade-deleted with evidence_items.';


-- ============================================================
-- SUPPLEMENTARY TABLES
-- Required by the existing UI but not in the original ordered spec.
-- Included here to complete the single migration.
-- ============================================================


-- Campaign updates posted by the organizing charity.
-- Feeds CampaignUpdates timeline component and UpdatesSubscriptionDialog.
CREATE TABLE campaign_updates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title             text NOT NULL,
  content           text NOT NULL,
  -- Optional progress percentage snapshot shown with the update
  progress_percent  integer CHECK (progress_percent BETWEEN 0 AND 100),
  posted_by         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  posted_at         timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

COMMENT ON TABLE campaign_updates
  IS 'Organizer-posted progress updates. Drives CampaignUpdates timeline and UpdatesSubscriptionDialog.';

CREATE TRIGGER trg_campaign_updates_updated_at
  BEFORE UPDATE ON campaign_updates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Media attached to campaign updates
CREATE TABLE campaign_update_media (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id    uuid NOT NULL REFERENCES campaign_updates(id) ON DELETE CASCADE,
  url          text NOT NULL,
  storage_path text,
  media_type   text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE campaign_update_media
  IS 'Images and videos attached to campaign updates. Cascade-deleted with campaign_updates.';


-- Donor messages displayed on campaign supporter walls.
-- display_name is denormalized at write time to bake in the
-- anonymity preference — avoids joins and prevents later exposure.
CREATE TABLE supporter_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  -- Optional link to the donation that prompted this message
  donation_id   uuid REFERENCES donations(id) ON DELETE SET NULL,
  donor_id      uuid REFERENCES donors(id)   ON DELETE SET NULL,
  message       text NOT NULL,
  is_anonymous  boolean NOT NULL DEFAULT false,
  -- Denormalized at write time: "Anonymous" if is_anonymous=true,
  -- else donors.display_name. Prevents later privacy leaks.
  display_name  text NOT NULL,
  posted_at     timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

COMMENT ON TABLE supporter_messages
  IS 'Donor messages on campaign walls. display_name baked in at write time ("Anonymous" if is_anonymous=true).';


-- Campaign update subscriptions (email / WhatsApp alerts).
-- At least one contact method must be present.
CREATE TABLE update_subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  donor_id        uuid REFERENCES donors(id) ON DELETE CASCADE,
  email           text,
  whatsapp        text,
  subscribed_at   timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,

  CONSTRAINT chk_subscription_has_contact CHECK (
    donor_id IS NOT NULL
    OR (email    IS NOT NULL AND trim(email)    <> '')
    OR (whatsapp IS NOT NULL AND trim(whatsapp) <> '')
  )
);

COMMENT ON TABLE update_subscriptions
  IS 'Campaign update subscribers. At least one of donor_id, email, or whatsapp required.';


-- ============================================================
-- 12. DONATION AUDIT LOG
-- ============================================================
-- Append-only financial event log. Every state change on every donation
-- is recorded here. Required for financial compliance, Stripe dispute
-- resolution, and PIPEDA audit trails.
-- No UPDATE or DELETE on this table. Ever.

CREATE TABLE donation_audit_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  donation_id      uuid NOT NULL REFERENCES donations(id) ON DELETE RESTRICT,

  previous_status  donation_status,      -- NULL for the initial 'created' event
  new_status       donation_status NOT NULL,

  -- NULL for system/webhook events (no authenticated user)
  changed_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- What triggered this change.
  -- Common values: 'created' | 'stripe_webhook' | 'manual_update' |
  --                'refund_issued' | 'dispute_opened' | 'dispute_resolved'
  event_type       text NOT NULL,

  -- Full event payload (e.g., raw Stripe webhook body).
  -- Stored for audit trail; may contain Stripe event IDs for reconciliation.
  metadata         jsonb,

  -- Immutable timestamp
  created_at       timestamptz NOT NULL DEFAULT now()
  -- No updated_at or deleted_at: append-only
);

COMMENT ON TABLE donation_audit_log
  IS 'Append-only financial audit trail. Every donation state change recorded here. No UPDATE or DELETE.';

-- Auto-insert audit log entry on donation INSERT or status UPDATE
CREATE OR REPLACE FUNCTION log_donation_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT'
     OR (TG_OP = 'UPDATE' AND NEW.status <> OLD.status)
  THEN
    INSERT INTO donation_audit_log
      (donation_id, previous_status, new_status, event_type, changed_by)
    VALUES (
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
      NEW.status,
      CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'status_change' END,
      auth.uid()   -- NULL when called by Edge Function via service role
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_donation_status_change
  AFTER INSERT OR UPDATE OF status ON donations
  FOR EACH ROW EXECUTE FUNCTION log_donation_status_change();


-- ============================================================
-- 13. PLATFORM STATS VIEW
-- ============================================================
-- Live aggregate statistics for the /impact page.
-- All values derived from real data — no hardcoded numbers anywhere.
-- Readable by anonymous users via GRANT below.
-- The view runs as the Postgres owner role (security definer behaviour
-- for views in Postgres), bypassing RLS on the underlying tables to
-- compute aggregates. Only aggregate/anonymized values are exposed.

CREATE OR REPLACE VIEW platform_stats AS
SELECT
  -- Total raised across all succeeded donations (CAD)
  COALESCE(
    SUM(d.amount) FILTER (WHERE d.status = 'succeeded' AND d.deleted_at IS NULL),
    0
  ) AS total_raised_cad,

  -- Unique donors with at least one succeeded donation
  COUNT(DISTINCT d.donor_id)
    FILTER (WHERE d.status = 'succeeded' AND d.deleted_at IS NULL)
    AS total_donors,

  -- Total number of individual succeeded transactions
  COUNT(*)
    FILTER (WHERE d.status = 'succeeded' AND d.deleted_at IS NULL)
    AS total_donations,

  -- Active approved campaigns
  (
    SELECT COUNT(*)
    FROM campaigns
    WHERE verification_status = 'approved'
      AND is_active = true
      AND deleted_at IS NULL
  ) AS active_campaigns,

  -- Verified (approved) organizations
  (
    SELECT COUNT(*)
    FROM organizations
    WHERE verification_status = 'approved'
      AND deleted_at IS NULL
  ) AS verified_organizations,

  -- Countries / regions covered by active approved campaigns
  (
    SELECT COUNT(DISTINCT country_code)
    FROM campaigns
    WHERE verification_status = 'approved'
      AND deleted_at IS NULL
  ) AS regions_covered,

  -- Zakat-specific ring-fenced totals (shown separately on /impact)
  COALESCE(
    SUM(d.amount)
      FILTER (WHERE d.status = 'succeeded' AND d.giving_type = 'zakat' AND d.deleted_at IS NULL),
    0
  ) AS total_zakat_raised_cad,

  COUNT(*)
    FILTER (WHERE d.status = 'succeeded' AND d.giving_type = 'zakat' AND d.deleted_at IS NULL)
    AS total_zakat_donations

FROM donations d;

COMMENT ON VIEW platform_stats
  IS 'Live aggregate stats for /impact page. Derived from real data. Readable by anonymous users.';


-- ============================================================
-- 14. INDEXES
-- ============================================================

-- organizations
CREATE INDEX idx_organizations_verification_status
  ON organizations(verification_status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_organizations_slug
  ON organizations(slug)
  WHERE deleted_at IS NULL;

-- campaigns
CREATE INDEX idx_campaigns_organization_id
  ON campaigns(organization_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_campaigns_category
  ON campaigns(category)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_campaigns_campaign_type
  ON campaigns(campaign_type)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_campaigns_giving_type
  ON campaigns(giving_type)
  WHERE deleted_at IS NULL AND giving_type IS NOT NULL;

CREATE INDEX idx_campaigns_verification_status
  ON campaigns(verification_status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_campaigns_zakat_eligible
  ON campaigns(zakat_eligible)
  WHERE deleted_at IS NULL AND zakat_eligible = true;

CREATE INDEX idx_campaigns_urgency
  ON campaigns(urgency)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_campaigns_slug
  ON campaigns(slug)
  WHERE deleted_at IS NULL;

-- Geospatial index for map bounding-box queries
CREATE INDEX idx_campaigns_location
  ON campaigns(lat, lng)
  WHERE deleted_at IS NULL AND lat IS NOT NULL AND lng IS NOT NULL;

-- donations
CREATE INDEX idx_donations_campaign_id
  ON donations(campaign_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_donations_donor_id
  ON donations(donor_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_donations_status
  ON donations(status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_donations_giving_type
  ON donations(giving_type)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_donations_stripe_payment_intent_id
  ON donations(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX idx_donations_recurring_donation_id
  ON donations(recurring_donation_id)
  WHERE recurring_donation_id IS NOT NULL;

-- receipts
CREATE INDEX idx_receipts_donation_id
  ON receipts(donation_id);

CREATE INDEX idx_receipts_serial_number
  ON receipts(receipt_serial_number);

-- recurring_donations
CREATE INDEX idx_recurring_donations_donor_id
  ON recurring_donations(donor_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_recurring_donations_stripe_subscription_id
  ON recurring_donations(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX idx_recurring_donations_status
  ON recurring_donations(status)
  WHERE deleted_at IS NULL;

-- verification_submissions
CREATE INDEX idx_verification_submissions_organization_id
  ON verification_submissions(organization_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_verification_submissions_campaign_id
  ON verification_submissions(campaign_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_verification_submissions_status
  ON verification_submissions(status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_verification_submissions_submitted_by
  ON verification_submissions(submitted_by)
  WHERE deleted_at IS NULL;

-- evidence_items
CREATE INDEX idx_evidence_items_campaign_id
  ON evidence_items(campaign_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_evidence_items_organization_id
  ON evidence_items(organization_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_evidence_items_submission_id
  ON evidence_items(submission_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_evidence_items_status
  ON evidence_items(status)
  WHERE deleted_at IS NULL;

-- evidence_media
CREATE INDEX idx_evidence_media_evidence_id
  ON evidence_media(evidence_id);

-- campaign_updates
CREATE INDEX idx_campaign_updates_campaign_id
  ON campaign_updates(campaign_id)
  WHERE deleted_at IS NULL;

-- supporter_messages
CREATE INDEX idx_supporter_messages_campaign_id
  ON supporter_messages(campaign_id)
  WHERE deleted_at IS NULL;

-- donation_audit_log
CREATE INDEX idx_donation_audit_log_donation_id
  ON donation_audit_log(donation_id);

CREATE INDEX idx_donation_audit_log_created_at
  ON donation_audit_log(created_at DESC);


-- ============================================================
-- 15. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE organizations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns                ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations                ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_donations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_decisions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_media           ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_update_media    ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporter_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_audit_log       ENABLE ROW LEVEL SECURITY;

-- ── RLS helper: get current user's platform role ──────────────────────────
-- SECURITY DEFINER so it reads from donors without being blocked by its
-- own RLS policy (avoids recursive policy evaluation).
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.donors
  WHERE id = auth.uid()
    AND deleted_at IS NULL
$$;

COMMENT ON FUNCTION get_my_role()
  IS 'Returns the platform role of the currently authenticated user. SECURITY DEFINER to avoid RLS recursion.';


-- ── organizations ─────────────────────────────────────────────────────────

-- Public: read approved organizations
CREATE POLICY "organizations: public read approved"
  ON organizations FOR SELECT
  USING (verification_status = 'approved' AND deleted_at IS NULL);

-- Submitter: read their own org at any status
CREATE POLICY "organizations: owner read own"
  ON organizations FOR SELECT
  USING (created_by = auth.uid() AND deleted_at IS NULL);

-- Charity admin: create a new org
CREATE POLICY "organizations: owner insert"
  ON organizations FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Charity admin: update their own org
-- Sensitive columns (verification_status, trust_score) must be
-- restricted to platform_admin at the application layer.
CREATE POLICY "organizations: owner update"
  ON organizations FOR UPDATE
  USING  (created_by = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (created_by = auth.uid());

-- Verifier: read all organizations (any status)
CREATE POLICY "organizations: verifier read all"
  ON organizations FOR SELECT
  USING (get_my_role() IN ('verifier', 'platform_admin'));

-- Platform admin: full access
CREATE POLICY "organizations: platform admin all"
  ON organizations FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── campaigns ─────────────────────────────────────────────────────────────

-- Public: read approved active campaigns
CREATE POLICY "campaigns: public read approved"
  ON campaigns FOR SELECT
  USING (verification_status = 'approved' AND is_active = true AND deleted_at IS NULL);

-- Submitter: read their own campaigns (any status)
CREATE POLICY "campaigns: owner read own"
  ON campaigns FOR SELECT
  USING (created_by = auth.uid() AND deleted_at IS NULL);

-- Charity admin: create campaigns
CREATE POLICY "campaigns: owner insert"
  ON campaigns FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Charity admin: update their own campaigns
CREATE POLICY "campaigns: owner update"
  ON campaigns FOR UPDATE
  USING  (created_by = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (created_by = auth.uid());

-- Verifier: read all campaigns
CREATE POLICY "campaigns: verifier read all"
  ON campaigns FOR SELECT
  USING (get_my_role() IN ('verifier', 'platform_admin'));

-- Platform admin: full access
CREATE POLICY "campaigns: platform admin all"
  ON campaigns FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── donors ────────────────────────────────────────────────────────────────

-- Donor: read and write only their own profile
CREATE POLICY "donors: read own"
  ON donors FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "donors: insert own"
  ON donors FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "donors: update own"
  ON donors FOR UPDATE
  USING  (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Verifier / platform admin: read all profiles
-- (needed for receipt generation and verification review)
CREATE POLICY "donors: admin read all"
  ON donors FOR SELECT
  USING (get_my_role() IN ('verifier', 'platform_admin'));

-- Platform admin: full access
CREATE POLICY "donors: platform admin all"
  ON donors FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── donations ─────────────────────────────────────────────────────────────

-- Donor: read their own donations
CREATE POLICY "donations: read own"
  ON donations FOR SELECT
  USING (donor_id = auth.uid() AND deleted_at IS NULL);

-- Donor: create their own donations
-- donor_id IS NULL allowed for guest (anonymous account-less) donations
CREATE POLICY "donations: insert own"
  ON donations FOR INSERT
  WITH CHECK (donor_id = auth.uid() OR donor_id IS NULL);

-- Platform admin: read and update all donations
-- (Edge Functions use service role key and bypass RLS for webhook processing)
CREATE POLICY "donations: platform admin all"
  ON donations FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── receipts ─────────────────────────────────────────────────────────────

-- Donor: read their own receipts (joined via donation → donor_id)
CREATE POLICY "receipts: read own"
  ON receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM donations
      WHERE donations.id        = receipts.donation_id
        AND donations.donor_id  = auth.uid()
    )
  );

-- Platform admin: full access
CREATE POLICY "receipts: platform admin all"
  ON receipts FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── recurring_donations ───────────────────────────────────────────────────

CREATE POLICY "recurring_donations: read own"
  ON recurring_donations FOR SELECT
  USING (donor_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "recurring_donations: insert own"
  ON recurring_donations FOR INSERT
  WITH CHECK (donor_id = auth.uid());

CREATE POLICY "recurring_donations: update own"
  ON recurring_donations FOR UPDATE
  USING  (donor_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (donor_id = auth.uid());

CREATE POLICY "recurring_donations: platform admin all"
  ON recurring_donations FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── verification_submissions ──────────────────────────────────────────────

-- Submitter: read their own submissions
CREATE POLICY "verification_submissions: read own"
  ON verification_submissions FOR SELECT
  USING (submitted_by = auth.uid() AND deleted_at IS NULL);

-- Submitter: create a submission
CREATE POLICY "verification_submissions: insert own"
  ON verification_submissions FOR INSERT
  WITH CHECK (submitted_by = auth.uid());

-- Submitter: update only while still in draft
CREATE POLICY "verification_submissions: update draft"
  ON verification_submissions FOR UPDATE
  USING  (submitted_by = auth.uid() AND status = 'draft' AND deleted_at IS NULL)
  WITH CHECK (submitted_by = auth.uid() AND status IN ('draft', 'submitted'));

-- Verifier: read all submissions
CREATE POLICY "verification_submissions: verifier read all"
  ON verification_submissions FOR SELECT
  USING (get_my_role() IN ('verifier', 'platform_admin'));

-- Platform admin: full access
CREATE POLICY "verification_submissions: platform admin all"
  ON verification_submissions FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── verification_decisions ────────────────────────────────────────────────

-- Submitter: read decisions on their own submissions
CREATE POLICY "verification_decisions: submitter read own"
  ON verification_decisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM verification_submissions vs
      WHERE vs.id           = verification_decisions.submission_id
        AND vs.submitted_by = auth.uid()
    )
  );

-- Verifier: read all decisions and insert new ones
CREATE POLICY "verification_decisions: verifier read all"
  ON verification_decisions FOR SELECT
  USING (get_my_role() IN ('verifier', 'platform_admin'));

CREATE POLICY "verification_decisions: verifier insert"
  ON verification_decisions FOR INSERT
  WITH CHECK (get_my_role() IN ('verifier', 'platform_admin'));

-- No UPDATE or DELETE policies — append-only by design.


-- ── evidence_items ────────────────────────────────────────────────────────

-- Public: read approved public evidence on approved campaigns/orgs
CREATE POLICY "evidence_items: public read approved"
  ON evidence_items FOR SELECT
  USING (
    visibility = 'public'
    AND status  = 'approved'
    AND deleted_at IS NULL
  );

-- Submitter: read their own evidence (any status)
CREATE POLICY "evidence_items: owner read own"
  ON evidence_items FOR SELECT
  USING (submitted_by = auth.uid() AND deleted_at IS NULL);

-- Submitter: upload evidence
CREATE POLICY "evidence_items: owner insert"
  ON evidence_items FOR INSERT
  WITH CHECK (submitted_by = auth.uid());

-- Verifier: read all evidence (including private items)
CREATE POLICY "evidence_items: verifier read all"
  ON evidence_items FOR SELECT
  USING (get_my_role() IN ('verifier', 'platform_admin'));

-- Verifier: update confidence_score and status
CREATE POLICY "evidence_items: verifier update"
  ON evidence_items FOR UPDATE
  USING  (get_my_role() IN ('verifier', 'platform_admin'));

-- Platform admin: full access
CREATE POLICY "evidence_items: platform admin all"
  ON evidence_items FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── evidence_media ────────────────────────────────────────────────────────

-- Inherits access from the parent evidence_items row.

CREATE POLICY "evidence_media: public read approved"
  ON evidence_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evidence_items ei
      WHERE ei.id         = evidence_media.evidence_id
        AND ei.visibility = 'public'
        AND ei.status     = 'approved'
        AND ei.deleted_at IS NULL
    )
  );

CREATE POLICY "evidence_media: owner read own"
  ON evidence_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evidence_items ei
      WHERE ei.id           = evidence_media.evidence_id
        AND ei.submitted_by = auth.uid()
    )
  );

CREATE POLICY "evidence_media: owner insert"
  ON evidence_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evidence_items ei
      WHERE ei.id           = evidence_media.evidence_id
        AND ei.submitted_by = auth.uid()
    )
  );

CREATE POLICY "evidence_media: verifier read all"
  ON evidence_media FOR SELECT
  USING (get_my_role() IN ('verifier', 'platform_admin'));

CREATE POLICY "evidence_media: platform admin all"
  ON evidence_media FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── campaign_updates ──────────────────────────────────────────────────────

-- Public: read updates on approved campaigns
CREATE POLICY "campaign_updates: public read on approved campaigns"
  ON campaign_updates FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id                  = campaign_updates.campaign_id
        AND c.verification_status = 'approved'
        AND c.deleted_at          IS NULL
    )
  );

-- Org admin: post and edit their campaign updates
CREATE POLICY "campaign_updates: owner insert"
  ON campaign_updates FOR INSERT
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY "campaign_updates: owner update"
  ON campaign_updates FOR UPDATE
  USING  (posted_by = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY "campaign_updates: platform admin all"
  ON campaign_updates FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── campaign_update_media ─────────────────────────────────────────────────

CREATE POLICY "campaign_update_media: public read on approved campaigns"
  ON campaign_update_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_updates cu
      JOIN campaigns c ON c.id = cu.campaign_id
      WHERE cu.id               = campaign_update_media.update_id
        AND cu.deleted_at       IS NULL
        AND c.verification_status = 'approved'
        AND c.deleted_at        IS NULL
    )
  );

CREATE POLICY "campaign_update_media: owner insert"
  ON campaign_update_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_updates cu
      WHERE cu.id        = campaign_update_media.update_id
        AND cu.posted_by = auth.uid()
    )
  );

CREATE POLICY "campaign_update_media: platform admin all"
  ON campaign_update_media FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── supporter_messages ────────────────────────────────────────────────────

-- Public: read messages on approved campaigns
CREATE POLICY "supporter_messages: public read on approved campaigns"
  ON supporter_messages FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id                  = supporter_messages.campaign_id
        AND c.verification_status = 'approved'
        AND c.deleted_at          IS NULL
    )
  );

-- Donor: post a message
CREATE POLICY "supporter_messages: donor insert"
  ON supporter_messages FOR INSERT
  WITH CHECK (donor_id = auth.uid() OR donor_id IS NULL);

CREATE POLICY "supporter_messages: platform admin all"
  ON supporter_messages FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── update_subscriptions ──────────────────────────────────────────────────

CREATE POLICY "update_subscriptions: read own"
  ON update_subscriptions FOR SELECT
  USING (donor_id = auth.uid());

-- Allow anonymous email/WhatsApp subscriptions (no donor_id required)
CREATE POLICY "update_subscriptions: insert"
  ON update_subscriptions FOR INSERT
  WITH CHECK (donor_id = auth.uid() OR donor_id IS NULL);

CREATE POLICY "update_subscriptions: update own"
  ON update_subscriptions FOR UPDATE
  USING  (donor_id = auth.uid())
  WITH CHECK (donor_id = auth.uid());

CREATE POLICY "update_subscriptions: platform admin all"
  ON update_subscriptions FOR ALL
  USING (get_my_role() = 'platform_admin');


-- ── donation_audit_log ────────────────────────────────────────────────────

-- Donor: read audit entries for their own donations
CREATE POLICY "donation_audit_log: read own"
  ON donation_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM donations d
      WHERE d.id        = donation_audit_log.donation_id
        AND d.donor_id  = auth.uid()
    )
  );

-- Platform admin: read all entries
CREATE POLICY "donation_audit_log: platform admin read all"
  ON donation_audit_log FOR SELECT
  USING (get_my_role() = 'platform_admin');

-- No UPDATE or DELETE policies — append-only enforced by design.
-- Edge Functions use the service role key (bypasses RLS) for inserts.


-- ============================================================
-- GRANTS
-- ============================================================
-- Grant SELECT on platform_stats to unauthenticated (anon) and
-- authenticated roles. The view exposes only aggregate counts/sums
-- — no PII. The view runs as the owner (Postgres) which has full
-- access to the underlying tables, so RLS on donations does not
-- block the aggregate computation.

GRANT SELECT ON platform_stats TO anon, authenticated;

-- Allow authenticated users to use the receipt serial sequence
-- (Edge Functions running as service role don't need this, but
--  the grant is harmless and allows direct testing)
GRANT USAGE ON SEQUENCE receipt_serial_seq TO authenticated;
