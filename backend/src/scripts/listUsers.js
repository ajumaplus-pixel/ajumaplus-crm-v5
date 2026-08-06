const pool = require('../config/database');

async function listUsers() {
  try {
    const [rows] = await pool.query('SELECT id, username, email, role, status FROM users');
    console.log('Current users in database:');
    console.log('========================');
    rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.status}`);
      console.log('------------------------');
    });
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listUsers();