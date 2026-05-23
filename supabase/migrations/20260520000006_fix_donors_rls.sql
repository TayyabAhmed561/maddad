-- Fix donors RLS policies — resolves "permission denied for table donors" 403 errors

DROP POLICY IF EXISTS "donors: insert own" ON donors;
DROP POLICY IF EXISTS "donors: read own" ON donors;
DROP POLICY IF EXISTS "donors: update own" ON donors;
DROP POLICY IF EXISTS "donors: upsert own" ON donors;
DROP POLICY IF EXISTS "donors: admin read all" ON donors;
DROP POLICY IF EXISTS "donors: platform admin all" ON donors;

CREATE POLICY "donors: read own"
  ON donors FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "donors: insert own"
  ON donors FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "donors: update own"
  ON donors FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "donors: admin read all"
  ON donors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM donors d
      WHERE d.id = auth.uid()
        AND d.role IN ('verifier', 'platform_admin')
    )
  );

CREATE POLICY "donors: platform admin all"
  ON donors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM donors d
      WHERE d.id = auth.uid()
        AND d.role = 'platform_admin'
    )
  );
