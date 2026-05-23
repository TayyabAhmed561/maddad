CREATE TABLE contact_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  email      text        NOT NULL,
  subject    text        NOT NULL,
  message    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can insert a contact message
CREATE POLICY "contact_messages_insert"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Platform admin can read all messages (queries own donors row — non-recursive)
CREATE POLICY "contact_messages_admin_select"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM donors
      WHERE donors.id = auth.uid()
        AND donors.role = 'platform_admin'
    )
  );
