-- ================================================================
-- E-ARZI DATABASE SCHEMA
-- Anantnag District Grievance Redressal System
-- Version 2.0 | Run this in your Supabase SQL Editor
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- USERS TABLE (all roles in one table)
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mobile        TEXT UNIQUE,
  username      TEXT UNIQUE,
  password_hash TEXT,
  name          TEXT,
  role          TEXT NOT NULL CHECK (role IN ('citizen', 'subadmin', 'officer', 'superadmin')),
  -- Citizen profile fields
  gender        TEXT,
  alt_mobile    TEXT,
  email         TEXT,
  address       TEXT,
  district      TEXT,
  block         TEXT,
  village       TEXT,
  verified      BOOLEAN DEFAULT FALSE,
  -- Staff fields
  department_id UUID,
  employee_id   TEXT,
  designation   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  created_by    UUID
);

-- Add citizen profile columns to existing installs (safe to re-run)
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender     TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS alt_mobile TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email      TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address    TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS district   TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS block      TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS village    TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified   BOOLEAN DEFAULT FALSE;

-- ================================================================
-- OTPs TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS otps (
  mobile      TEXT PRIMARY KEY,
  otp         TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- DEPARTMENTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS departments (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  description TEXT,
  head_officer_id UUID,
  sla_high    INTEGER DEFAULT 24,  -- hours
  sla_medium  INTEGER DEFAULT 48,
  sla_low     INTEGER DEFAULT 72,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by  UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

-- FK from users to departments (safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_dept'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT fk_users_dept
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ================================================================
-- COMPLAINTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS complaints (
  id                  TEXT PRIMARY KEY,  -- ARZ-YYYY-NNNNNN
  citizen_id          UUID REFERENCES users(id),
  category            TEXT NOT NULL,
  description         TEXT NOT NULL,
  block               TEXT NOT NULL,
  village             TEXT NOT NULL,
  priority            TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('EMERGENCY', 'HIGH', 'MEDIUM', 'LOW')),
  status              TEXT DEFAULT 'SUBMITTED' CHECK (status IN (
    'SUBMITTED', 'ASSIGNED', 'REASSIGNED', 'IN_PROGRESS',
    'ESCALATED', 'RESOLVED', 'REOPENED', 'CLOSED', 'AUTO_CLOSED', 'REJECTED'
  )),
  assigned_dept_id    UUID REFERENCES departments(id),
  assigned_officer_id UUID REFERENCES users(id),
  assigned_by         UUID REFERENCES users(id),
  assignment_note     TEXT,
  rejection_reason    TEXT,
  sla_deadline        TIMESTAMPTZ,
  reopen_count        INTEGER DEFAULT 0,
  has_attachments     BOOLEAN DEFAULT FALSE,
  has_feedback        BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_complaints_citizen    ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status     ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_officer    ON complaints(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_dept       ON complaints(assigned_dept_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created    ON complaints(created_at DESC);

-- ================================================================
-- COMPLAINT ATTACHMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS complaint_attachments (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  complaint_id TEXT REFERENCES complaints(id),
  file_url    TEXT NOT NULL,
  file_type   TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- COMPLAINT TIMELINE (immutable event log)
-- ================================================================
CREATE TABLE IF NOT EXISTS complaint_timeline (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  complaint_id TEXT REFERENCES complaints(id),
  actor_id    UUID REFERENCES users(id),
  actor_role  TEXT NOT NULL,
  action      TEXT NOT NULL,
  remarks     TEXT,
  proof_url   TEXT,
  timestamp   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_complaint ON complaint_timeline(complaint_id);

-- ================================================================
-- NOTIFICATIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES users(id),
  complaint_id TEXT REFERENCES complaints(id),
  type        TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read);

-- ================================================================
-- FEEDBACK
-- ================================================================
CREATE TABLE IF NOT EXISTS feedback (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  complaint_id TEXT REFERENCES complaints(id),
  citizen_id  UUID REFERENCES users(id),
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SLA CONFIG (per-department overrides)
-- ================================================================
CREATE TABLE IF NOT EXISTS sla_config (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  department_id   UUID REFERENCES departments(id),
  priority        TEXT NOT NULL,
  response_hours  INTEGER NOT NULL,
  resolution_hours INTEGER NOT NULL,
  updated_by      UUID REFERENCES users(id),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- AUDIT LOG (append-only)
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id    UUID,
  actor_role  TEXT,
  action      TEXT NOT NULL,
  target_table TEXT,
  target_id   TEXT,
  old_value   JSONB,
  new_value   JSONB,
  ip          TEXT,
  timestamp   TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent UPDATE and DELETE on audit_log
CREATE OR REPLACE RULE audit_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE OR REPLACE RULE audit_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;

-- ================================================================
-- SEED: Default Super Admin Account
-- username: admin | password: Admin@12345
-- ================================================================
INSERT INTO users (name, username, password_hash, role)
VALUES ('Super Admin', 'admin', 'Admin@12345', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- ================================================================
-- SEED: Sample Departments
-- ================================================================
INSERT INTO departments (name, code, description, sla_high, sla_medium, sla_low, status)
VALUES
  ('Public Works Department', 'PWD', 'Roads, bridges, infrastructure maintenance', 24, 240, 360, 'active'),
  ('Jal Shakti', 'JSK', 'Water supply, sanitation, drainage', 24, 192, 288, 'active'),
  ('Education Department', 'EDU', 'Schools, colleges, scholarships', 48, 240, 360, 'active'),
  ('Health Department', 'HLT', 'Hospitals, PHCs, public health programs', 2, 48, 120, 'active'),
  ('Agriculture Department', 'AGR', 'Farming support, irrigation, land use', 48, 240, 360, 'active'),
  ('Revenue Department', 'REV', 'Land records, mutation, property issues', 72, 240, 360, 'active'),
  ('Social Welfare', 'SWD', 'Pensions, disability, women & child welfare', 48, 240, 360, 'active'),
  ('Electricity Department', 'ELC', 'Power supply, connections, outages', 2, 48, 120, 'active')
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable on all sensitive tables
-- ================================================================
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_attachments ENABLE ROW LEVEL SECURITY;

-- Service role bypasses all policies (used in API routes only)
-- Public / anon reads are blocked by default

-- Citizens: see only their own complaints
DROP POLICY IF EXISTS citizen_own_complaints ON complaints;
CREATE POLICY citizen_own_complaints ON complaints
  FOR SELECT USING (
    auth.uid()::text = citizen_id::text
    OR current_setting('request.jwt.claims', true)::jsonb->>'role' IN ('superadmin', 'subadmin', 'officer')
  );

-- Officers: see only assigned complaints
DROP POLICY IF EXISTS officer_assigned_complaints ON complaints;
CREATE POLICY officer_assigned_complaints ON complaints
  FOR SELECT USING (
    current_setting('request.jwt.claims', true)::jsonb->>'role' = 'officer'
    AND auth.uid()::text = assigned_officer_id::text
  );

-- Disable anon access to users table
DROP POLICY IF EXISTS block_anon_users ON users;
CREATE POLICY block_anon_users ON users
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::jsonb->>'role' IN ('superadmin', 'subadmin', 'officer', 'citizen')
  );

-- ================================================================
-- STORAGE BUCKET
-- ================================================================
-- Create this bucket manually in Supabase Dashboard > Storage:
-- Bucket name: complaint-attachments
-- Public: false (access controlled via signed URLs)
