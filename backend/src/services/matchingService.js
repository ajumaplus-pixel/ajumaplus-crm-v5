const ISP = require('../models/ISP');
const Job = require('../models/Job');

class MatchingService {
  // Calculate distance between two GPS coordinates (Haversine formula)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Calculate match score for ISP and job
  static calculateMatchScore(job, isp) {
    let score = 0;
    
    // Skills match (40% weight)
    if (isp.skills && Array.isArray(isp.skills)) {
      const skills = typeof isp.skills === 'string' ? JSON.parse(isp.skills) : isp.skills;
      if (skills.includes(job.category) || skills.some(skill => skill.toLowerCase().includes(job.category.toLowerCase()))) {
        score += 40;
      }
    }
    
    // Location proximity (25% weight)
    if (job.gps_coords && isp.gps_coords) {
      const jobCoords = typeof job.gps_coords === 'string' ? JSON.parse(job.gps_coords) : job.gps_coords;
      const ispCoords = typeof isp.gps_coords === 'string' ? JSON.parse(isp.gps_coords) : isp.gps_coords;
      
      const distance = this.calculateDistance(jobCoords.lat, jobCoords.lng, ispCoords.lat, ispCoords.lng);
      if (distance < 10) score += 25;
      else if (distance < 25) score += 15;
      else if (distance < 50) score += 10;
      else if (distance < 100) score += 5;
    }
    
    // Rating (15% weight)
    const rating = isp.rating || 0;
    score += Math.min(rating * 3, 15);
    
    // Availability (10% weight)
    if (isp.availability === 'available') score += 10;
    else if (isp.availability === 'busy') score += 5;
    
    // Experience (10% weight)
    const experience = isp.experience_years || 0;
    score += Math.min(experience, 10);
    
    return Math.min(score, 100); // Cap at 100
  }

  // Find best matching ISPs for a job
  static async findMatchingISPs(job, limit = 5) {
    try {
      const allISPs = await ISP.getAll(100, 0);
      const availableISPs = allISPs.filter(isp => isp.availability === 'available' || isp.availability === 'busy');
      
      const scoredISPs = availableISPs.map(isp => ({
        isp,
        score: this.calculateMatchScore(job, isp),
        distance: job.gps_coords && isp.gps_coords ? 
          this.calculateDistance(
            typeof job.gps_coords === 'string' ? JSON.parse(job.gps_coords).lat : job.gps_coords.lat,
            typeof job.gps_coords === 'string' ? JSON.parse(job.gps_coords).lng : job.gps_coords.lng,
            typeof isp.gps_coords === 'string' ? JSON.parse(isp.gps_coords).lat : isp.gps_coords.lat,
            typeof isp.gps_coords === 'string' ? JSON.parse(isp.gps_coords).lng : isp.gps_coords.lng
          ) : null
      }));
      
      // Sort by score (descending) and distance (ascending)
      scoredISPs.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        return 0;
      });
      
      return scoredISPs.slice(0, limit);
    } catch (error) {
      console.error('Error finding matching ISPs:', error);
      return [];
    }
  }

  // Suggest assignments for pending jobs
  static async suggestAssignments() {
    try {
      const pendingJobs = await Job.getByStatus('new');
      const suggestions = [];
      
      for (const job of pendingJobs) {
        const matches = await this.findMatchingISPs(job);
        suggestions.push({
          job,
          matches: matches.map(m => ({
            isp_id: m.isp.id,
            isp_name: m.isp.trade,
            score: m.score,
            distance: m.distance,
            rating: m.isp.rating,
            experience: m.isp.experience_years
          }))
        });
      }
      
      return suggestions;
    } catch (error) {
      console.error('Error suggesting assignments:', error);
      return [];
    }
  }
}

module.exports = MatchingService;