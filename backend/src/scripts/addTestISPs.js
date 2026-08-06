const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function addTestISPs() {
  try {
    console.log('Adding test ISPs for quote generation...');

    // Get or create the ISP user
    let userId;
    const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', ['isp@test.com']);
    if (userRows.length === 0) {
      console.log('ISP user not found, creating...');
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      userId = uuidv4();
      
      await pool.query(
        'INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [userId, 'testisp', 'isp@test.com', hashedPassword, 'isp', 'active']
      );
      
      console.log('Created ISP user:', userId);
    } else {
      userId = userRows[0].id;
      console.log('ISP user found:', userId);
    }

    // Delete existing ISP profiles for this user
    await pool.query('DELETE FROM isps WHERE user_id = ?', [userId]);
    console.log('Cleared existing ISP profiles');

    // Create ISP profiles with different trades and locations
    const isps = [
      {
        user_id: userId,
        trade: 'Electrical',
        location: 'Accra, East Legon',
        gps_coords: JSON.stringify({ lat: 5.6037, lng: -0.1870 }),
        skills: JSON.stringify(['Wiring', 'Installation', 'Maintenance', 'electrical']),
        availability: 'available',
        rating: 4.5,
        jobs_completed: 15,
        experience_years: 5,
        certification: JSON.stringify({ name: 'Electrical License Level 2', issuer: 'Ghana Energy Commission' }),
        payment_details: 'Mobile Money: 0241234567'
      },
      {
        user_id: userId,
        trade: 'Plumbing',
        location: 'Kumasi, Adum',
        gps_coords: JSON.stringify({ lat: 6.6885, lng: -1.6244 }),
        skills: JSON.stringify(['Pipe fitting', 'Installation', 'Repairs', 'plumbing']),
        availability: 'available',
        rating: 4.2,
        jobs_completed: 12,
        experience_years: 4,
        certification: JSON.stringify({ name: 'Plumbing License', issuer: 'Ghana Water Authority' }),
        payment_details: 'Mobile Money: 0241234567'
      },
      {
        user_id: userId,
        trade: 'Carpentry',
        location: 'Tamale, Aboabo',
        gps_coords: JSON.stringify({ lat: 9.4033, lng: -0.8393 }),
        skills: JSON.stringify(['Furniture making', 'Installation', 'Repairs', 'carpentry']),
        availability: 'available',
        rating: 4.0,
        jobs_completed: 8,
        experience_years: 3,
        certification: JSON.stringify({ name: 'Carpentry Certificate', issuer: 'Ghana Technical Institute' }),
        payment_details: 'Mobile Money: 0241234567'
      }
    ];

    // Clear existing ISPs for this user
    await pool.query('DELETE FROM isps WHERE user_id = ?', [userId]);
    console.log('Cleared existing ISP profiles for this user');

    for (const isp of isps) {
      const ispId = uuidv4();
      await pool.query(
        `INSERT INTO isps (id, user_id, trade, location, gps_coords, skills, availability, rating, jobs_completed, experience_years, certification, payment_details, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [ispId, isp.user_id, isp.trade, isp.location, isp.gps_coords, isp.skills, isp.availability, isp.rating, isp.jobs_completed, isp.experience_years, isp.certification, isp.payment_details]
      );
      console.log(`Created ISP: ${isp.trade} - ${isp.location}`);
    }

    console.log('\n✅ Test ISPs added successfully!');
    console.log('Test users:');
    console.log('  Customer: customer@example.com / Test123!');
    console.log('  ISP: isp@test.com / Test123!');
    console.log('  Admin: admin@test.com / Test123!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding test ISPs:', error);
    process.exit(1);
  }
}

addTestISPs();