-- community_appeal_intakes: intake form for personal/community appeals
-- Anyone (anon or authenticated) can INSERT. Only platform_admin can SELECT/UPDATE/DELETE.

CREATE TABLE public.community_appeal_intakes (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text        NOT NULL,
  email            text        NOT NULL,
  need_type        text        NOT NULL CHECK (need_type IN ('medical', 'housing', 'education', 'emergency', 'other')),
  description      text        NOT NULL,
  endorsing_contact text       NOT NULL,
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'more_info')),
  admin_notes      text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_appeal_intakes ENABLE ROW LEVEL SECURITY;

-- Anon and authenticated users can submit
CREATE POLICY "appeal_intakes_insert"
  ON public.community_appeal_intakes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only platform_admin can read and manage
CREATE POLICY "appeal_intakes_admin_all"
  ON public.community_appeal_intakes
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  );
