const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function addSampleData() {
  try {
    const password = 'Test123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get test customer ID
    const [customerRows] = await pool.query('SELECT id FROM users WHERE email = ?', ['customer@example.com']);
    const customerId = customerRows[0]?.id;
    
    if (!customerId) {
      console.error('Test customer not found');
      process.exit(1);
    }

    console.log('Using customer ID:', customerId);

    // Sample Jobs
    const jobs = [
      {
        id: uuidv4(),
        job_number: 'JOB-001',
        category: 'electrical',
        description: 'Install ceiling fan in living room',
        priority: 'normal',
        address: 'Accra, East Legon',
        status: 'pending',
        gps_coords: JSON.stringify({ lat: 5.6037, lng: -0.1870 }),
      },
      {
        id: uuidv4(),
        job_number: 'JOB-002',
        category: 'plumbing',
        description: 'Fix leaking kitchen sink',
        priority: 'urgent',
        address: 'Kumasi, Adum',
        status: 'in_progress',
        gps_coords: JSON.stringify({ lat: 6.6885, lng: -1.6244 }),
      },
      {
        id: uuidv4(),
        job_number: 'JOB-003',
        category: 'carpentry',
        description: 'Build custom bookshelf',
        priority: 'high',
        address: 'Tamale, Aboabo',
        status: 'completed',
        gps_coords: JSON.stringify({ lat: 9.4033, lng: -0.8393 }),
      },
      {
        id: uuidv4(),
        job_number: 'JOB-004',
        category: 'solar',
        description: 'Install solar panel system',
        priority: 'normal',
        address: 'Cape Coast, Pedu',
        status: 'pending',
        gps_coords: JSON.stringify({ lat: 5.1055, lng: -1.2466 }),
      },
      {
        id: uuidv4(),
        job_number: 'JOB-005',
        category: 'general',
        description: 'Home maintenance services',
        priority: 'low',
        address: 'Takoradi, Essipon',
        status: 'assigned',
        gps_coords: JSON.stringify({ lat: 4.8805, lng: -1.7547 }),
      },
    ];

    for (const job of jobs) {
      await pool.query(
        `INSERT INTO jobs (id, job_number, category, description, priority, address, status, gps_coords, customer_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [job.id, job.job_number, job.category, job.description, job.priority, job.address, job.status, job.gps_coords, customerId]
      );
      console.log(`✅ Added job: ${job.job_number}`);
    }

    // Update ISP with GPS coordinates
    await pool.query(
      'UPDATE isps SET gps_coords = ?, location = ? WHERE id = ?',
      [JSON.stringify({ lat: 5.6037, lng: -0.1870 }), 'Accra, East Legon', '72d64758-7b52-432d-8699-93ea864fccce']
    );
    console.log('✅ Updated ISP location');

    console.log('\n✅ Sample data added successfully!');
    console.log('Test users:');
    console.log('  Customer: customer@example.com / Test123!');
    console.log('  ISP: isp@test.com / Test123!');
    console.log('  Admin: admin@test.com / Test123!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample data:', error);
    process.exit(1);
  }
}

addSampleData();