const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Rating {
  static async create(ratingData) {
    const { 
      job_id, 
      customer_id, 
      isp_id, 
      quality, 
      timeliness, 
      professionalism, 
      communication, 
      overall, 
      comment 
    } = ratingData;
    const id = uuidv4();
    
    const query = `
      INSERT INTO ratings (
        id, job_id, customer_id, isp_id, quality, timeliness,
        professionalism, communication, overall, comment,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    `;

    const values = [
      id, job_id, customer_id, isp_id, quality, timeliness,
      professionalism, communication, overall, comment
    ];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM ratings WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByJobId(jobId) {
    const query = 'SELECT * FROM ratings WHERE job_id = $1';
    const result = await pool.query(query, [jobId]);
    return result.rows[0];
  }

  static async findByJobAndISP(jobId, ispId) {
    const query = 'SELECT * FROM ratings WHERE job_id = $1 AND isp_id = $2';
    const result = await pool.query(query, [jobId, ispId]);
    return result.rows[0];
  }

  static async findByISPId(ispId, limit = 50, offset = 0) {
    const query = 'SELECT * FROM ratings WHERE isp_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    const result = await pool.query(query, [ispId, limit, offset]);
    return result.rows;
  }

  static async getAverageRating(ispId) {
    const query = `
      SELECT
        AVG(overall) as average_rating,
        COUNT(*) as total_ratings,
        AVG(quality) as avg_quality,
        AVG(timeliness) as avg_timeliness,
        AVG(professionalism) as avg_professionalism,
        AVG(communication) as avg_communication
      FROM ratings
      WHERE isp_id = $1
    `;
    const result = await pool.query(query, [ispId]);
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = 'SELECT * FROM ratings ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async update(id, updateData) {
    const {
      quality,
      timeliness,
      professionalism,
      communication,
      overall,
      comment,
      reported,
      report_reason,
      reported_by,
      reported_at,
      isp_response,
      responded_at
    } = updateData;

    const query = `
      UPDATE ratings
      SET quality = $1, timeliness = $2, professionalism = $3, communication = $4,
          overall = $5, comment = $6, reported = $7, report_reason = $8,
          reported_by = $9, reported_at = $10, isp_response = $11, responded_at = $12, updated_at = NOW()
      WHERE id = $13
    `;

    const values = [
      quality, timeliness, professionalism, communication, overall, comment,
      reported, report_reason, reported_by, reported_at, isp_response, responded_at, id
    ];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM ratings WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async getReportedRatings(limit = 50, offset = 0) {
    const query = 'SELECT * FROM ratings WHERE reported = true ORDER BY reported_at DESC LIMIT $1 OFFSET $2';
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }
}

module.exports = Rating;