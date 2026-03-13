-- ─── Smart Hostel Complaint System ─────────────────────────────
-- Initial Database Setup
-- ────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS hostel_complaints;
USE hostel_complaints;

-- Tables are auto-created by Hibernate (ddl-auto=update)
-- This file seeds initial admin account

-- Seed Admin User (password: admin123 — BCrypt hashed)
INSERT IGNORE INTO users (name, email, password, role, room_number, created_at)
VALUES (
  'Hostel Admin',
  'admin@hostel.edu',
  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
  'ADMIN',
  NULL,
  NOW()
);

-- Seed Demo Student (password: student123 — BCrypt hashed)
INSERT IGNORE INTO users (name, email, password, role, room_number, created_at)
VALUES (
  'Demo Student',
  'student@hostel.edu',
  '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQsn.We3TsQxgXk3A4jg.R.y.H7bNu',
  'STUDENT',
  'A-101',
  NOW()
);
