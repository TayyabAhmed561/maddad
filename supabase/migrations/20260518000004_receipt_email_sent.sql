-- ── email_sent_at on receipts ─────────────────────────────────────────────────
-- Tracks when the tax receipt email was dispatched via Resend.
-- Null means the email has not been sent yet (e.g. created before this migration,
-- or the send-receipt function hasn't run yet).

ALTER TABLE public.receipts
  ADD COLUMN IF NOT EXISTS email_sent_at timestamptz;
