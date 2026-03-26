-- ============================================================
-- Migration: New Features
-- 1. KYC fields on users table
-- 2. complaint_messages table (officer-citizen messaging)
-- 3. Bank + health document fields on red_cross_applications
-- ============================================================

-- ── 1. KYC fields on users ────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS aadhaar_no         TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url  TEXT,
  ADD COLUMN IF NOT EXISTS passport_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_card_url   TEXT;

-- ── 2. complaint_messages table ───────────────────────────
CREATE TABLE IF NOT EXISTS complaint_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id  TEXT        NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  sender_id     UUID        NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  sender_role   TEXT        NOT NULL,   -- 'citizen' | 'officer' | 'superadmin' | 'subadmin'
  sender_name   TEXT        NOT NULL,
  message       TEXT        NOT NULL,
  document_urls TEXT[],                 -- optional uploaded document URLs
  is_request    BOOLEAN     NOT NULL DEFAULT FALSE, -- officer can flag as doc/info request
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup per complaint
CREATE INDEX IF NOT EXISTS idx_complaint_messages_complaint_id
  ON complaint_messages (complaint_id, created_at ASC);

-- ── 3. Bank + health docs on red_cross_applications ──────
ALTER TABLE red_cross_applications
  ADD COLUMN IF NOT EXISTS bank_account_no  TEXT,
  ADD COLUMN IF NOT EXISTS bank_name        TEXT,
  ADD COLUMN IF NOT EXISTS ifsc_code        TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch      TEXT,
  ADD COLUMN IF NOT EXISTS health_documents TEXT[];  -- array of uploaded health doc URLs

-- ── Supabase Storage buckets (run once manually if needed) ──
-- These buckets must be created via the Supabase dashboard or CLI:
--   profile-docs      (public)  — citizen profile/passport/aadhaar photos
--   complaint-messages (public) — documents attached to messages
--   red-cross-docs    (public)  — red cross application documents + health reports
