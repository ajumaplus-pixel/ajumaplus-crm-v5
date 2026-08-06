-- Create test users for development
-- Password for all test users: Test123!

-- Test Customer
INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at)
VALUES (
  UUID(),
  'testcustomer',
  'customer@test.com',
  '$2a$10$YourHashedPasswordHere',
  'customer',
  'active',
  NOW(),
  NOW()
);

-- Test ISP
INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at)
VALUES (
  UUID(),
  'testisp',
  'isp@test.com',
  '$2a$10$YourHashedPasswordHere',
  'isp',
  'active',
  NOW(),
  NOW()
);

-- Test Admin
INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at)
VALUES (
  UUID(),
  'testadmin',
  'admin@test.com',
  '$2a$10$YourHashedPasswordHere',
  'admin',
  'active',
  NOW(),
  NOW()
);