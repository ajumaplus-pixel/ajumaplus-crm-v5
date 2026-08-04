require('dotenv').config();

// Support both MySQL (development) and PostgreSQL (Render production)
let pool;

if (process.env.DATABASE_URL) {
  // PostgreSQL for Render
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  pool.connect()
    .then(() => console.log('✅ PostgreSQL database connected successfully'))
    .catch(error => console.error('❌ PostgreSQL connection failed:', error.message));
    
} else {
  // MySQL for development
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'ajumaplus',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  pool.getConnection()
    .then(connection => {
      console.log('✅ MySQL database connected successfully');
      connection.release();
    })
    .catch(error => {
      console.error('❌ MySQL connection failed:', error.message);
    });
}

module.exports = pool;