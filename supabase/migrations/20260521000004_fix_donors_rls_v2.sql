-- ── Drop ALL donor policies (nuclear option) ────────────────────────────────
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE tablename = 'donors' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.donors', r.policyname);
  END LOOP;
END $$;

-- ── Simple non-recursive policies ───────────────────────────────────────────
CREATE POLICY "own_select" ON donors
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "own_insert" ON donors
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "own_update" ON donors
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Service role (edge functions, admin SDK) has unrestricted access
CREATE POLICY "service_role_all" ON donors
  FOR ALL TO service_role
  USING (true);

-- ── Sync donor role to JWT app_metadata via trigger ──────────────────────────
-- This lets clients read the role from the JWT instead of querying the table,
-- eliminating any risk of recursive policy evaluation.

CREATE OR REPLACE FUNCTION sync_donor_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM COALESCE(OLD.role, '') THEN
    UPDATE auth.users
    SET raw_app_meta_data =
      COALESCE(raw_app_meta_data, '{}'::jsonb) ||
      jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_donor_role ON donors;
CREATE TRIGGER sync_donor_role
  AFTER INSERT OR UPDATE OF role ON donors
  FOR EACH ROW EXECUTE FUNCTION sync_donor_role_to_jwt();

-- Run once to backfill app_metadata for all existing donors
UPDATE donors SET role = role;

-- ── Update get_my_role() to read from JWT claims ─────────────────────────────
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'role',
    'donor'
  )
$$;
