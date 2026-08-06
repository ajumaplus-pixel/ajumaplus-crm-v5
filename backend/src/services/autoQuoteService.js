const MatchingService = require('./matchingService');
const Quotation = require('../models/Quotation');
const Job = require('../models/Job');
const ISP = require('../models/ISP');
const pool = require('../config/database');

class AutoQuoteService {
  // Generate 3 tier quotes for a job
  static async generateQuotesForJob(jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error('Job not found');

    // Find top 3 matching ISPs
    const matches = await MatchingService.findMatchingISPs(job, 3);
    if (matches.length === 0) throw new Error('No matching ISPs found');

    const quotes = [];
    const tiers = ['budget', 'standard', 'premium'];

    for (let i = 0; i < Math.min(matches.length, 3); i++) {
      const tier = tiers[i];
      const match = matches[i];
      const isp = match.isp;

      // Calculate pricing based on tier
      const pricing = this.calculateTierPricing(job, isp, tier, match.score);

      // Create quotation
      const quote = await Quotation.create({
        job_id: jobId,
        labour_cost: pricing.labour,
        materials_cost: pricing.materials,
        travel_cost: pricing.travel,
        experience_factor: match.score / 100,
        complexity_factor: this.getComplexityFactor(job.priority),
        urgency_factor: this.getUrgencyFactor(job.priority),
        total: pricing.total,
        tier: tier,
        suggested_isp_id: isp.id,
        expires_at: this.calculateExpiration(),
        is_auto_generated: true,
        notes: `Auto-generated ${tier} tier quote based on ISP matching score: ${match.score.toFixed(0)}/100`,
        created_by: 'system'
      });

      quotes.push({
        ...quote,
        isp_name: isp.trade,
        isp_rating: isp.rating,
        match_score: match.score,
        distance: match.distance
      });
    }

    // Update job with quote expiration
    await pool.query(
      'UPDATE jobs SET quote_expires_at = ?, auto_generated_quotes = TRUE, status = ? WHERE id = ?',
      [this.calculateExpiration(), 'pending_quotes', jobId]
    );

    return quotes;
  }

  // Calculate pricing based on tier
  static calculateTierPricing(job, isp, tier, matchScore) {
    const basePricing = this.calculateBasePricing(job, isp);
    const tierMultiplier = {
      budget: 0.8,
      standard: 1.0,
      premium: 1.3
    }[tier];

    return {
      labour: basePricing.labour * tierMultiplier,
      materials: basePricing.materials,
      travel: basePricing.travel,
      total: (basePricing.labour + basePricing.materials + basePricing.travel) * tierMultiplier
    };
  }

  // Calculate base pricing
  static calculateBasePricing(job, isp) {
    // Base pricing logic based on job category, complexity, location
    const categoryRates = {
      'electrical': { labour: 200, materials: 100 },
      'plumbing': { labour: 180, materials: 120 },
      'carpentry': { labour: 150, materials: 150 },
      'solar': { labour: 300, materials: 500 },
      'general': { labour: 120, materials: 80 }
    };

    const rates = categoryRates[job.category.toLowerCase()] || categoryRates['general'];
    const distance = job.gps_coords && isp.gps_coords ? 
      MatchingService.calculateDistance(
        typeof job.gps_coords === 'string' ? JSON.parse(job.gps_coords).lat : job.gps_coords.lat,
        typeof job.gps_coords === 'string' ? JSON.parse(job.gps_coords).lng : job.gps_coords.lng,
        typeof isp.gps_coords === 'string' ? JSON.parse(isp.gps_coords).lat : isp.gps_coords.lat,
        typeof isp.gps_coords === 'string' ? JSON.parse(isp.gps_coords).lng : isp.gps_coords.lng
      ) : 10;

    return {
      labour: rates.labour,
      materials: rates.materials,
      travel: distance * 5 // GHS 5 per km
    };
  }

  // Calculate expiration (24-48 hours)
  static calculateExpiration() {
    const hours = 24 + Math.floor(Math.random() * 24); // 24-48 hours
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + hours);
    return expiration;
  }

  // Get complexity factor
  static getComplexityFactor(priority) {
    const factors = { urgent: 1.5, high: 1.3, normal: 1.0, low: 0.8 };
    return factors[priority] || 1.0;
  }

  // Get urgency factor
  static getUrgencyFactor(priority) {
    const factors = { urgent: 1.4, high: 1.2, normal: 1.0, low: 0.9 };
    return factors[priority] || 1.0;
  }

  // Check if quotes are expired
  static async checkQuoteExpiration(jobId) {
    const job = await Job.findById(jobId);
    if (!job.quote_expires_at) return { expired: false };

    const expired = new Date() > new Date(job.quote_expires_at);
    if (expired && job.status === 'pending_quotes') {
      // Expired quotes - regenerate
      await this.generateQuotesForJob(jobId);
    }

    return { expired, expiresAt: job.quote_expires_at };
  }
}

module.exports = AutoQuoteService;