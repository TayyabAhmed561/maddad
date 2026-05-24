-- Approve any campaigns that are in draft or submitted state so the
-- landing page Verified Needs section has content to display.
-- Safe to run multiple times (idempotent WHERE clause).

UPDATE public.campaigns
SET verification_status = 'approved', is_active = true
WHERE verification_status IN ('draft', 'submitted');

UPDATE public.organizations
SET verification_status = 'approved'
WHERE verification_status IN ('draft', 'submitted');
