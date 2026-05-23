-- Drop ALL existing donor policies first
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'donors'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON donors';
  END LOOP;
END $$;

-- Recreate clean minimal policies
CREATE POLICY "donors_select_own"
  ON donors FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "donors_insert_own"
  ON donors FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "donors_update_own"
  ON donors FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "donors_admin_select"
  ON donors FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM donors
      WHERE role IN ('verifier', 'platform_admin')
    )
  );
