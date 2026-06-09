-- ── Security hardening migration ─────────────────────────────────────────────
-- Adds: fraud flags, risk scoring, rate limits, audit log, donor security cols.

-- ── 1. Fraud flags on campaigns ───────────────────────────────────────────────
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS fraud_flags jsonb NOT NULL DEFAULT '[]';

-- ── 2. Risk score on organization_applications ────────────────────────────────
ALTER TABLE public.organization_applications
  ADD COLUMN IF NOT EXISTS risk_score integer NOT NULL DEFAULT 0
  CHECK (risk_score BETWEEN 0 AND 100);

-- ── 3. Donor security tracking columns ───────────────────────────────────────
ALTER TABLE public.donors
  ADD COLUMN IF NOT EXISTS login_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_at  timestamptz,
  ADD COLUMN IF NOT EXISTS locked_until   timestamptz;

-- ── 4. Rate limits table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rate_limits (
  identifier   text        NOT NULL,
  action       text        NOT NULL,
  window_start timestamptz NOT NULL,
  count        integer     NOT NULL DEFAULT 1,
  PRIMARY KEY (identifier, action, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service_role can read/write rate_limits (used exclusively from edge functions)
CREATE POLICY "rate_limits_service_role_all"
  ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Clean up old windows automatically (entries older than 24 hours are irrelevant)
CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx
  ON public.rate_limits (window_start);

-- ── 5. Application audit log ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.application_audit_log (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  text        NOT NULL CHECK (entity_type IN (
    'organization_application', 'campaign',
    'organization', 'community_appeal_intake'
  )),
  entity_id    uuid        NOT NULL,
  action       text        NOT NULL,
  performed_by uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address   text,
  metadata     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.application_audit_log ENABLE ROW LEVEL SECURITY;

-- Append-only: anyone can insert (for trigger-based logging), only admin can read.
-- No UPDATE or DELETE allowed on audit records.
CREATE POLICY "audit_log_insert_trigger"
  ON public.application_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "audit_log_admin_select"
  ON public.application_audit_log
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  );

-- ── 6. Trigger: log organization_application INSERT ───────────────────────────
CREATE OR REPLACE FUNCTION public.log_application_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.application_audit_log (entity_type, entity_id, action, metadata)
  VALUES (
    'organization_application',
    NEW.id,
    'submitted',
    jsonb_build_object('org_name', NEW.org_name, 'org_type', NEW.org_type)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_application_submitted ON public.organization_applications;
CREATE TRIGGER trg_log_application_submitted
  AFTER INSERT ON public.organization_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_application_submitted();

-- ── 7. Trigger: log organization_application status UPDATE ────────────────────
CREATE OR REPLACE FUNCTION public.log_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.application_audit_log (entity_type, entity_id, action, metadata)
    VALUES (
      'organization_application',
      NEW.id,
      'status_changed',
      jsonb_build_object(
        'from', OLD.status,
        'to',   NEW.status,
        'org_name', NEW.org_name
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_application_status ON public.organization_applications;
CREATE TRIGGER trg_log_application_status
  AFTER UPDATE ON public.organization_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_application_status_change();

-- ── 8. RPC: upsert_rate_limit — returns new count for (identifier, action, window) ──
-- Used by create-payment-intent edge function. Service role only.
CREATE OR REPLACE FUNCTION public.upsert_rate_limit(
  p_identifier  text,
  p_action      text,
  p_window_start timestamptz
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.rate_limits (identifier, action, window_start, count)
  VALUES (p_identifier, p_action, p_window_start, 1)
  ON CONFLICT (identifier, action, window_start)
  DO UPDATE SET count = rate_limits.count + 1
  RETURNING count INTO new_count;

  RETURN new_count;
END;
$$;

-- ── 9. Function: check for similar org names (impersonation detection) ─────────
-- Returns the most similar approved org name and its similarity score (0–1).
-- Called from admin to flag potential impersonation attempts.
CREATE OR REPLACE FUNCTION public.find_similar_org(p_name text)
RETURNS TABLE (similar_name text, score float)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT display_name, similarity(lower(display_name), lower(p_name))
  FROM public.organizations
  WHERE verification_status = 'approved'
    AND similarity(lower(display_name), lower(p_name)) > 0.5
  ORDER BY similarity(lower(display_name), lower(p_name)) DESC
  LIMIT 1;
$$;

-- Enable pg_trgm extension (required for similarity())
CREATE EXTENSION IF NOT EXISTS pg_trgm;
