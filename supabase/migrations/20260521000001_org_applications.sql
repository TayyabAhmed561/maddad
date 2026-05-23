-- ============================================================
-- Maddad Platform — Organization Applications
-- Version:     008
-- Date:        2026-05-21
-- Purpose:     Public application flow — orgs apply before
--              creating an account. Admin reviews and one-click
--              creates org + campaign on approval.
-- ============================================================


-- ============================================================
-- TABLE: organization_applications
-- ============================================================

CREATE TABLE organization_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organization info
  org_name        text NOT NULL,
  org_type        text NOT NULL CHECK (org_type IN (
    'registered_charity', 'masjid', 'university_msa', 'community_group'
  )),
  province        text NOT NULL DEFAULT 'ON',
  website_url     text,
  org_description text NOT NULL,

  -- Campaign info
  campaign_title       text NOT NULL,
  campaign_type        text NOT NULL,
  campaign_category    text NOT NULL,
  campaign_goal_cad    numeric(12,2),
  campaign_description text NOT NULL,
  zakat_eligible       boolean NOT NULL DEFAULT false,

  -- Contact info
  contact_name  text NOT NULL,
  contact_role  text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  cra_number    text,
  how_heard     text,

  -- Documents: array of Supabase Storage paths
  -- Format: ["applications/{uuid}/filename.pdf", ...]
  document_paths jsonb NOT NULL DEFAULT '[]',

  -- Review workflow
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'approved', 'rejected', 'more_info_needed'
  )),
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,

  -- Set on approval — links to the auto-created org
  created_organization_id uuid REFERENCES organizations(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for admin queue (newest first + status filter)
CREATE INDEX idx_org_applications_status
  ON organization_applications(status, created_at DESC);

CREATE INDEX idx_org_applications_email
  ON organization_applications(contact_email);


-- ============================================================
-- RLS: anyone can INSERT (no auth needed to apply).
--      Platform admin can read and update all rows.
-- ============================================================

ALTER TABLE organization_applications ENABLE ROW LEVEL SECURITY;

-- Public: submit an application without an account
CREATE POLICY "anyone can submit application"
  ON organization_applications
  FOR INSERT
  WITH CHECK (true);

-- Platform admin: full access (read, update, delete)
CREATE POLICY "platform admin full access to applications"
  ON organization_applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM donors
      WHERE id = auth.uid()
        AND role = 'platform_admin'
    )
  );


-- ============================================================
-- STORAGE NOTE
-- ============================================================
-- Documents are uploaded to the existing evidence-docs bucket
-- under the path: applications/{application_uuid}/
--
-- Storage RLS policy required in Supabase dashboard:
--   Bucket: evidence-docs
--   Policy: "allow public insert to applications folder"
--     INSERT allowed WHERE bucket_id = 'evidence-docs'
--       AND name LIKE 'applications/%'
--
-- Admins download via signed URLs (service-role key).
-- ============================================================
