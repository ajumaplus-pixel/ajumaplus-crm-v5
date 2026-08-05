require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    await pool.connect();
    console.log('✅ Database connected successfully');

    console.log('Reading initialization script...');
    const initScript = fs.readFileSync(
      path.join(__dirname, '../init-db.sql'),
      'utf8'
    );

    console.log('Executing initialization script...');
    await pool.query(initScript);
    console.log('✅ Database initialized successfully');

    console.log('\n🎉 Setup complete!');
    console.log('Default admin user: admin@example.com / admin123');
    console.log('Default staff user: staff@example.com / staff123');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();