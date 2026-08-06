const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function createTestUsers() {
  try {
    const password = 'Test123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    // Test Customer
    try {
      const customerId = uuidv4();
      await pool.query(
        'INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [customerId, 'testcustomer', 'customer@test.com', hashedPassword, 'customer', 'active']
      );
      console.log('Created test customer: customer@test.com / Test123!');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('Test customer already exists: customer@test.com / Test123!');
      } else {
        throw error;
      }
    }

    // Test ISP
    try {
      const ispId = uuidv4();
      await pool.query(
        'INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [ispId, 'testisp', 'isp@test.com', hashedPassword, 'isp', 'active']
      );
      console.log('Created test ISP: isp@test.com / Test123!');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('Test ISP already exists: isp@test.com / Test123!');
      } else {
        throw error;
      }
    }

    // Test Admin
    try {
      const adminId = uuidv4();
      await pool.query(
        'INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [adminId, 'testadmin', 'admin@test.com', hashedPassword, 'admin', 'active']
      );
      console.log('Created test admin: admin@test.com / Test123!');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('Test admin already exists: admin@test.com / Test123!');
      } else {
        throw error;
      }
    }

    console.log('\nTest User Credentials:');
    console.log('========================');
    console.log('Customer: customer@test.com / Test123!');
    console.log('ISP: isp@test.com / Test123!');
    console.log('Admin: admin@test.com / Test123!');
    console.log('========================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();