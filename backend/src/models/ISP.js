const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class ISP {
  static async create(ispData) {
    const { user_id, trade, location, gps_coords, skills, experience_years, certification, payment_details } = ispData;
    const id = uuidv4();
    
    const query = `
      INSERT INTO isps (id, user_id, trade, location, gps_coords, skills, experience_years, certification, payment_details, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [id, user_id, trade, location, gps_coords, JSON.stringify(skills), experience_years, JSON.stringify(certification), payment_details];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM isps WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result[0];
  }

  static async findByUserId(user_id) {
    const query = 'SELECT * FROM isps WHERE user_id = ?';
    const [result] = await pool.query(query, [user_id]);
    return result[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = 'SELECT * FROM isps ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [result] = await pool.query(query, [limit, offset]);
    return result;
  }

  static async update(id, updateData) {
    const { trade, location, gps_coords, skills, availability, experience_years, certification, payment_details } = updateData;
    const query = `
      UPDATE isps
      SET trade = ?, location = ?, gps_coords = ?, skills = ?, availability = ?,
          experience_years = ?, certification = ?, payment_details = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const values = [trade, location, gps_coords, JSON.stringify(skills), availability, experience_years, JSON.stringify(certification), payment_details, id];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async updateAvailability(id, availability) {
    const query = 'UPDATE isps SET availability = ?, updated_at = NOW() WHERE id = ?';
    await pool.query(query, [availability, id]);
    return await this.findById(id);
  }

  static async updateRating(id, rating) {
    const query = 'UPDATE isps SET rating = ?, updated_at = NOW() WHERE id = ?';
    await pool.query(query, [rating, id]);
    return await this.findById(id);
  }

  static async incrementJobsCompleted(id) {
    const query = 'UPDATE isps SET jobs_completed = jobs_completed + 1, updated_at = NOW() WHERE id = ?';
    await pool.query(query, [id]);
    return await this.findById(id);
  }

  static async getJobs(ispId) {
    const query = 'SELECT * FROM jobs WHERE isp_id = ? ORDER BY created_at DESC';
    const [result] = await pool.query(query, [ispId]);
    return result;
  }

  static async getRatings(ispId) {
    const query = 'SELECT * FROM ratings WHERE isp_id = ? ORDER BY created_at DESC';
    const [result] = await pool.query(query, [ispId]);
    return result;
  }

  static async getAvailableByLocation(location, limit = 10) {
    const query = `
      SELECT * FROM isps
      WHERE location LIKE ? AND availability = 'available'
      ORDER BY rating DESC, jobs_completed DESC
      LIMIT ?
    `;
    const [result] = await pool.query(query, [`%${location}%`, limit]);
    return result;
  }

  static async getByTrade(trade, limit = 10) {
    const query = `
      SELECT * FROM isps
      WHERE trade LIKE ? AND availability = 'available'
      ORDER BY rating DESC, jobs_completed DESC
      LIMIT ?
    `;
    const [result] = await pool.query(query, [`%${trade}%`, limit]);
    return result;
  }

  static async updateCurrentLocation(id, lat, lng) {
    const query = `
      UPDATE isps 
      SET current_location = JSON_OBJECT('lat', ?, 'lng', ?),
          last_location_update = NOW(),
          updated_at = NOW() 
      WHERE id = ?
    `;
    await pool.query(query, [lat, lng, id]);
    return await this.findById(id);
  }

  static async getCurrentLocation(id) {
    const query = 'SELECT current_location FROM isps WHERE id = ?';
    const result = await pool.query(query, [id]);
    return result[0]?.current_location;
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  static async getNearbyISPs(lat, lng, radiusKm = 50) {
    const allISPs = await this.getAll(100, 0);
    return allISPs.filter(isp => {
      if (!isp.gps_coords) return false;
      const gpsCoords = typeof isp.gps_coords === 'string' ? JSON.parse(isp.gps_coords) : isp.gps_coords;
      const distance = this.calculateDistance(
        lat, lng,
        gpsCoords.lat, gpsCoords.lng
      );
      return distance <= radiusKm;
    });
  }
}

module.exports = ISP;