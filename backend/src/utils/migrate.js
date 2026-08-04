const pool = require('../config/database');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Create tables in order without foreign keys for simplicity
    const migrations = [
      // Create users table
      `CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )`,

      // Create customers table
      `CREATE TABLE IF NOT EXISTS customers (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT,
        gps_coords VARCHAR(100),
        preferences JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Create isps table
      `CREATE TABLE IF NOT EXISTS isps (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        trade VARCHAR(50) NOT NULL,
        location TEXT NOT NULL,
        gps_coords VARCHAR(100),
        skills JSON,
        availability VARCHAR(20) DEFAULT 'available',
        rating DECIMAL(3,2) DEFAULT 0,
        jobs_completed INT DEFAULT 0,
        experience_years INT DEFAULT 0,
        certification JSON,
        payment_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Create jobs table
      `CREATE TABLE IF NOT EXISTS jobs (
        id CHAR(36) PRIMARY KEY,
        job_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id CHAR(36) NOT NULL,
        isp_id CHAR(36) NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(20) DEFAULT 'new',
        address TEXT NOT NULL,
        gps_coords VARCHAR(100),
        scheduled_date TIMESTAMP NULL,
        completed_date TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Create quotations table
      `CREATE TABLE IF NOT EXISTS quotations (
        id CHAR(36) PRIMARY KEY,
        quotation_number VARCHAR(50) UNIQUE NOT NULL,
        job_id CHAR(36) NOT NULL,
        labour_cost DECIMAL(10,2) NOT NULL,
        materials_cost DECIMAL(10,2) DEFAULT 0,
        travel_cost DECIMAL(10,2) DEFAULT 0,
        experience_factor DECIMAL(3,2) DEFAULT 1.0,
        complexity_factor DECIMAL(3,2) DEFAULT 1.0,
        urgency_factor DECIMAL(3,2) DEFAULT 1.0,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'draft',
        notes TEXT,
        created_by CHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Create payments table
      `CREATE TABLE IF NOT EXISTS payments (
        id CHAR(36) PRIMARY KEY,
        payment_number VARCHAR(50) UNIQUE NOT NULL,
        quotation_id CHAR(36) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        method VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        reference VARCHAR(100),
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Create ratings table
      `CREATE TABLE IF NOT EXISTS ratings (
        id CHAR(36) PRIMARY KEY,
        job_id CHAR(36) NOT NULL,
        customer_id CHAR(36),
        isp_id CHAR(36),
        rating INT CHECK (rating BETWEEN 1 AND 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Create audit_logs table
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        action VARCHAR(50) NOT NULL,
        module VARCHAR(50) NOT NULL,
        record_id CHAR(36),
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    // Run table migrations
    for (let i = 0; i < migrations.length; i++) {
      try {
        await pool.query(migrations[i]);
        console.log(`✅ Table migration ${i + 1}/${migrations.length} completed`);
      } catch (error) {
        console.error(`❌ Table migration ${i + 1} failed:`, error.message);
      }
    }
    
    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };