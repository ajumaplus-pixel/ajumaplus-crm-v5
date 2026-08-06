const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function resetPasswords() {
  try {
    const password = 'Test123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    // Update customer@example.com
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, 'customer@example.com']
    );
    console.log('✅ Reset password for customer@example.com');

    // Update isp@test.com
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, 'isp@test.com']
    );
    console.log('✅ Reset password for isp@test.com');

    // Update admin@test.com
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, 'admin@test.com']
    );
    console.log('✅ Reset password for admin@test.com');

    console.log('\n✅ All passwords reset to: Test123!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting passwords:', error);
    process.exit(1);
  }
}

resetPasswords();