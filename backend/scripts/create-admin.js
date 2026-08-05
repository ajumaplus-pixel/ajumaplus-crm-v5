require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAdminUser() {
  try {
    console.log('Connecting to database...');
    await pool.connect();
    console.log('✅ Database connected successfully');

    // Check if admin user exists
    const checkQuery = 'SELECT * FROM users WHERE email = $1';
    const checkResult = await pool.query(checkQuery, ['admin@example.com']);

    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      return;
    }

    // Create admin user
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = '00000000-0000-0000-0000-000000000001';

    const insertQuery = `
      INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `;

    await pool.query(insertQuery, [
      id,
      'admin',
      'admin@example.com',
      hashedPassword,
      'admin',
      'active'
    ]);

    console.log('✅ Admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

    // Create staff user
    const staffPassword = 'staff123';
    const staffHashedPassword = await bcrypt.hash(staffPassword, 10);
    const staffId = '00000000-0000-0000-0000-000000000002';

    const staffInsertQuery = `
      INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `;

    await pool.query(staffInsertQuery, [
      staffId,
      'staff',
      'staff@example.com',
      staffHashedPassword,
      'staff',
      'active'
    ]);

    console.log('✅ Staff user created successfully');
    console.log('Email: staff@example.com');
    console.log('Password: staff123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdminUser();