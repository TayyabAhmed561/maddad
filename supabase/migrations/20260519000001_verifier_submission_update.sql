-- Migration: 20260519000001_verifier_submission_update.sql
-- Grants verifiers the ability to update submission and entity
-- verification_status, needed for the review workflow.

-- Verifier: update any submission status (under_review, approved, rejected)
CREATE POLICY "verification_submissions: verifier update status"
  ON verification_submissions FOR UPDATE
  USING  (get_my_role() IN ('verifier', 'platform_admin'))
  WITH CHECK (get_my_role() IN ('verifier', 'platform_admin'));

-- Verifier: update organization verification_status during review
CREATE POLICY "organizations: verifier update status"
  ON organizations FOR UPDATE
  USING  (get_my_role() IN ('verifier', 'platform_admin'))
  WITH CHECK (get_my_role() IN ('verifier', 'platform_admin'));

-- Verifier: update campaign verification_status during review
CREATE POLICY "campaigns: verifier update status"
  ON campaigns FOR UPDATE
  USING  (get_my_role() IN ('verifier', 'platform_admin'))
  WITH CHECK (get_my_role() IN ('verifier', 'platform_admin'));
