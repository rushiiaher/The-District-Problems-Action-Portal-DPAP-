-- ================================================================
-- RED CROSS APPLICATION SYSTEM — Schema Additions
-- Run this in your Supabase SQL Editor
-- ================================================================

-- Step 1: Add bank_manager role to users table
-- (Drop and recreate the CHECK constraint)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('citizen', 'subadmin', 'officer', 'superadmin', 'bank_manager'));

-- Step 2: Red Cross Applications table
CREATE TABLE IF NOT EXISTS red_cross_applications (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  citizen_id       UUID REFERENCES users(id) NOT NULL,
  -- Applicant details (may differ from profile)
  full_name        TEXT NOT NULL,
  father_name      TEXT,
  dob              DATE,
  gender           TEXT,
  aadhaar          TEXT,
  mobile           TEXT NOT NULL,
  address          TEXT NOT NULL,
  district         TEXT,
  block            TEXT,
  village          TEXT,
  -- Application
  purpose          TEXT NOT NULL,
  purpose_category TEXT,                   -- dropdown category
  amount_requested NUMERIC(10,2),
  documents        TEXT[],                 -- Supabase Storage URLs
  -- Review
  status           TEXT DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','UNDER_REVIEW','APPROVED','REJECTED','PAID','CANCELLED')),
  approved_amount  NUMERIC(10,2),
  admin_remarks    TEXT,
  reviewed_by      UUID REFERENCES users(id),
  reviewed_at      TIMESTAMPTZ,
  -- Payment
  payment_ref      TEXT,
  paid_by          UUID REFERENCES users(id),
  paid_at          TIMESTAMPTZ,
  -- Timestamps
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rca_citizen ON red_cross_applications(citizen_id);
CREATE INDEX IF NOT EXISTS idx_rca_status  ON red_cross_applications(status);
CREATE INDEX IF NOT EXISTS idx_rca_created ON red_cross_applications(created_at DESC);

-- ================================================================
-- SEED: Test Bank Manager User
-- Login at /auth/login → Staff tab
-- Username: bank.manager | Password: BankManager@123
-- ================================================================
INSERT INTO users (name, username, password_hash, role, designation, created_at)
VALUES (
  'Bank Manager',
  'bank.manager',
  'BankManager@123',
  'bank_manager',
  'District Treasury Officer',
  NOW()
)
ON CONFLICT (username) DO NOTHING;


-- Step 3: Verify the table was created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'red_cross_applications'
ORDER BY ordinal_position;

-- ================================================================
-- NOTE: Also create a Supabase Storage bucket named:
--   red-cross-docs
-- with Public access enabled (so admins can preview documents).
-- Go to: Supabase Dashboard > Storage > Create Bucket
-- ================================================================
