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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      id, job_id, customer_id, isp_id, quality, timeliness, 
      professionalism, communication, overall, comment
    ];
    await pool.query(query, values);
    
    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM ratings WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByJobId(jobId) {
    const query = 'SELECT * FROM ratings WHERE job_id = ?';
    const [rows] = await pool.query(query, [jobId]);
    return rows[0];
  }

  static async findByJobAndISP(jobId, ispId) {
    const query = 'SELECT * FROM ratings WHERE job_id = ? AND isp_id = ?';
    const [rows] = await pool.query(query, [jobId, ispId]);
    return rows[0];
  }

  static async findByISPId(ispId, limit = 50, offset = 0) {
    const query = 'SELECT * FROM ratings WHERE isp_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.query(query, [ispId, limit, offset]);
    return rows;
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
      WHERE isp_id = ?
    `;
    const [rows] = await pool.query(query, [ispId]);
    return rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = 'SELECT * FROM ratings ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.query(query, [limit, offset]);
    return rows;
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
      SET quality = ?, timeliness = ?, professionalism = ?, communication = ?, 
          overall = ?, comment = ?, reported = ?, report_reason = ?, 
          reported_by = ?, reported_at = ?, isp_response = ?, responded_at = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const values = [
      quality, timeliness, professionalism, communication, overall, comment,
      reported, report_reason, reported_by, reported_at, isp_response, responded_at, id
    ];
    await pool.query(query, values);
    
    return await this.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM ratings WHERE id = ?';
    await pool.query(query, [id]);
  }

  static async getReportedRatings(limit = 50, offset = 0) {
    const query = 'SELECT * FROM ratings WHERE reported = true ORDER BY reported_at DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.query(query, [limit, offset]);
    return rows;
  }
}

module.exports = Rating;