const pool = require('../config/database');
const AutoQuoteService = require('../services/autoQuoteService');
const { v4: uuidv4 } = require('uuid');

async function testQuoteGeneration() {
  try {
    console.log('Testing quote generation...');

    // Create a test job
    const jobId = uuidv4();
    const jobData = {
      category: 'electrical',
      description: 'Test job for quote generation',
      priority: 'normal',
      address: 'Accra, East Legon',
      gps_coords: JSON.stringify({ lat: 5.6037, lng: -0.1870 }),
      customer_id: '1b53a8ce-ef64-40a4-9633-fb2607f93c91' // test customer
    };

    await pool.query(
      `INSERT INTO jobs (id, job_number, category, description, priority, address, gps_coords, customer_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', NOW(), NOW())`,
      [jobId, `TEST-QUOTE-${Date.now()}`, jobData.category, jobData.description, jobData.priority, jobData.address, jobData.gps_coords, jobData.customer_id]
    );

    console.log('Created test job:', jobId);

    // Generate quotes
    const quotes = await AutoQuoteService.generateQuotesForJob(jobId);
    console.log('Generated quotes:', quotes.length);
    console.log('Quote details:', quotes.map(q => ({
      tier: q.tier,
      total: q.total,
      isp_name: q.isp_name,
      match_score: q.match_score
    })));

    // Check the job status
    const [jobRows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
    console.log('Job status after quote generation:', jobRows[0].status);
    console.log('Quote expires at:', jobRows[0].quote_expires_at);
    console.log('Auto generated quotes:', jobRows[0].auto_generated_quotes);

    console.log('\n✅ Quote generation test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Quote generation test failed:', error);
    process.exit(1);
  }
}

testQuoteGeneration();