-- AjumaPlus CRM Database Initialization Script for PostgreSQL
-- This script creates all necessary tables and a default admin user

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(50),
  address TEXT,
  gps_coords TEXT,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ISPs (Independent Service Providers) table
CREATE TABLE IF NOT EXISTS isps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trade VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  gps_coords TEXT,
  skills JSONB,
  availability VARCHAR(50) DEFAULT 'available',
  experience_years INTEGER DEFAULT 0,
  certification JSONB,
  payment_details TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  jobs_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  isp_id UUID REFERENCES isps(id) ON DELETE SET NULL,
  category VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'normal',
  status VARCHAR(50) DEFAULT 'new',
  address TEXT,
  gps_coords TEXT,
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_number VARCHAR(50) UNIQUE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  labour_cost DECIMAL(10,2) DEFAULT 0.00,
  materials_cost DECIMAL(10,2) DEFAULT 0.00,
  travel_cost DECIMAL(10,2) DEFAULT 0.00,
  experience_factor DECIMAL(3,2) DEFAULT 1.00,
  complexity_factor DECIMAL(3,2) DEFAULT 1.00,
  urgency_factor DECIMAL(3,2) DEFAULT 1.00,
  total DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  reference TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  isp_id UUID REFERENCES isps(id) ON DELETE CASCADE,
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5),
  professionalism INTEGER CHECK (professionalism >= 1 AND professionalism <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  overall INTEGER CHECK (overall >= 1 AND overall <= 5),
  comment TEXT,
  reported BOOLEAN DEFAULT FALSE,
  report_reason TEXT,
  reported_by UUID REFERENCES users(id),
  reported_at TIMESTAMP,
  isp_response TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_type VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  form_data JSONB,
  webhook_received TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  account_created TIMESTAMP,
  user_id UUID REFERENCES users(id),
  email_sent TIMESTAMP,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_isps_user_id ON isps(user_id);
CREATE INDEX IF NOT EXISTS idx_isps_trade ON isps(trade);
CREATE INDEX IF NOT EXISTS idx_isps_location ON isps(location);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_isp_id ON jobs(isp_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_quotations_job_id ON quotations(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_quotation_id ON payments(quotation_id);
CREATE INDEX IF NOT EXISTS idx_ratings_isp_id ON ratings(isp_id);
CREATE INDEX IF NOT EXISTS idx_ratings_job_id ON ratings(job_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON form_submissions(email);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type ON form_submissions(form_type);

-- Create default admin user
-- Password: admin123 (bcrypt hash)
INSERT INTO users (username, email, password_hash, role, status)
VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$0/5x/C9uccZkxw1TZovZ5uN9P4K2yd6lcqJaj.Vt9zUkdrnnzRidq',
  'admin',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Create default staff user
-- Password: staff123 (bcrypt hash)
INSERT INTO users (username, email, password_hash, role, status)
VALUES (
  'staff',
  'staff@example.com',
  '$2a$10$u0O3dx/1LUgJQz45RdPcQ.VSNJBqEBw.Z0pFPUKV1DBoxW/e0MRBq',
  'staff',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database initialization completed successfully!';
  RAISE NOTICE 'Default admin user: admin@example.com / admin123';
  RAISE NOTICE 'Default staff user: staff@example.com / staff123';
END $$;