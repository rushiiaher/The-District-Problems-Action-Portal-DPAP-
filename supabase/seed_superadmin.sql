-- ================================================================
-- SUPER ADMIN SEED SCRIPT
-- Run this in your Supabase SQL Editor to create the super admin
-- ================================================================

-- Step 1: Insert superadmin user
-- Using plain-text password (Admin@12345) — matches the login API's
-- simple string comparison. Upgrade to bcrypt hash in production.

INSERT INTO users (name, username, password_hash, role)
VALUES (
  'Super Administrator',
  'admin',
  'Admin@12345',
  'superadmin'
)
ON CONFLICT (username) DO UPDATE
  SET name          = EXCLUDED.name,
      password_hash = EXCLUDED.password_hash,
      role          = EXCLUDED.role;

-- Step 2: Verify the user was created
SELECT id, name, username, role, created_at
FROM users
WHERE role = 'superadmin';

-- ================================================================
-- DEFAULT CREDENTIALS
-- URL      : http://localhost:3001/admin/login
-- Username : admin
-- Password : Admin@12345
-- ================================================================
-- IMPORTANT: Change the password immediately after first login.
-- ================================================================
