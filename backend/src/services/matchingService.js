const ISP = require('../models/ISP');
const Job = require('../models/Job');
const Rating = require('../models/Rating');
const { cache, cacheKeys, cacheTTL } = require('../config/redis');
const { logger } = require('../utils/logger');

class MatchingService {
  // Smart ISP matching algorithm
  async matchISPForJob(jobData) {
    const { category, location, urgency, complexity, description } = jobData;
    
    // Check cache first
    const cacheKey = `match:${category}:${location}:${urgency}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.debug('ISP match cache hit', { cacheKey });
      return cached;
    }

    try {
      // Get available ISPs by location
      const locationISPs = await ISP.getAvailableByLocation(location, 20);
      
      // Get ISPs by trade category
      const tradeISPs = await ISP.getByTrade(category, 20);
      
      // Combine and deduplicate ISPs
      const allISPs = this.deduplicateISPs([...locationISPs, ...tradeISPs]);
      
      // Score each ISP based on multiple factors
      const scoredISPs = await this.scoreISPs(allISPs, jobData);
      
      // Sort by score (highest first)
      scoredISPs.sort((a, b) => b.score - a.score);
      
      // Get top 5 matches
      const topMatches = scoredISPs.slice(0, 5);
      
      const result = {
        jobData,
        matches: topMatches,
        totalAvailable: allISPs.length,
        confidence: this.calculateConfidence(topMatches, jobData),
        alternatives: this.getAlternativeStrategies(jobData, allISPs.length)
      };
      
      // Cache the result
      await cache.set(cacheKey, result, cacheTTL.short);
      
      logger.info('ISP matching completed', {
        category,
        location,
        matches: topMatches.length,
        confidence: result.confidence
      });
      
      return result;
    } catch (error) {
      logger.error('ISP matching error:', error);
      throw error;
    }
  }

  // Score ISPs based on multiple factors
  async scoreISPs(isps, jobData) {
    const { category, urgency, complexity, location } = jobData;
    
    const scoredISPs = await Promise.all(isps.map(async (isp) => {
      const score = await this.calculateISPScore(isp, jobData);
      
      return {
        ...isp,
        score,
        scoreBreakdown: {
          skillMatch: score.skillMatch,
          locationProximity: score.locationProximity,
          availability: score.availability,
          rating: score.rating,
          experience: score.experience,
          workload: score.workload
        }
      };
    }));
    
    return scoredISPs;
  }

  // Calculate individual ISP score
  async calculateISPScore(isp, jobData) {
    const { category, urgency, complexity, location } = jobData;
    
    let score = 0;
    const maxScore = 100;
    
    // 1. Skill match (30 points)
    const skillMatch = this.calculateSkillMatch(isp, category);
    score += skillMatch * 0.3;
    
    // 2. Location proximity (20 points)
    const locationProximity = this.calculateLocationProximity(isp, location);
    score += locationProximity * 0.2;
    
    // 3. Availability (15 points)
    const availability = this.calculateAvailability(isp);
    score += availability * 0.15;
    
    // 4. Rating (20 points)
    const rating = this.calculateRatingScore(isp);
    score += rating * 0.2;
    
    // 5. Experience (10 points)
    const experience = this.calculateExperienceScore(isp);
    score += experience * 0.1;
    
    // 6. Workload (5 points) - lower is better
    const workload = this.calculateWorkloadScore(isp);
    score += workload * 0.05;
    
    return {
      score: Math.min(score, maxScore),
      skillMatch: skillMatch,
      locationProximity,
      availability,
      rating,
      experience,
      workload
    };
  }

  // Calculate skill match score
  calculateSkillMatch(isp, category) {
    const skills = isp.skills || [];
    const skillScore = skills.includes(category) ? 100 : 
                         skills.some(skill => skill.toLowerCase().includes(category.split('_')[0])) ? 80 : 50;
    return skillScore;
  }

  // Calculate location proximity score
  calculateLocationProximity(isp, jobLocation) {
    // Simplified location matching - would use Google Maps API in production
    const ispLocation = isp.location?.toLowerCase() || '';
    const jobLoc = jobLocation?.toLowerCase() || '';
    
    if (ispLocation === jobLoc) return 100;
    if (ispLocation.includes(jobLoc) || jobLoc.includes(ispLocation)) return 80;
    if (this.isNearbyLocation(ispLocation, jobLoc)) return 60;
    return 30;
  }

  // Check if locations are nearby (Ghana regions)
  isNearbyLocation(loc1, loc2) {
    const regions = {
      'accra': ['tema', 'kasoa', 'madina', 'east legon', 'ablekuma'],
      'kumasi': ['suame', 'koforidua', 'sunyani', 'tamale'],
      'takoradi': ['sekondi-takoradi', 'cape coast', 'elmina'],
      'tamale': ['bolgatanga', 'wa', 'navrongo']
    };
    
    const loc1Lower = loc1.toLowerCase();
    const loc2Lower = loc2.toLowerCase();
    
    for (const [region, nearby] of Object.entries(regions)) {
      if (loc1Lower.includes(region) || loc2Lower.includes(region)) {
        return nearby.some(nearby => 
          loc1Lower.includes(nearby) || loc2Lower.includes(nearby)
        );
      }
    }
    
    return false;
  }

  // Calculate availability score
  calculateAvailability(isp) {
    const availability = isp.availability?.toLowerCase() || 'unknown';
    
    switch (availability) {
      case 'available': return 100;
      case 'limited': return 70;
      case 'busy': return 30;
      case 'unavailable': return 0;
      default: return 50;
    }
  }

  // Calculate rating score
  async calculateRatingScore(isp) {
    const avgRating = await Rating.getAverageRating(isp.id);
    const rating = avgRating?.average_rating || isp.rating || 3.0;
    
    // Normalize to 0-100 scale (assuming 5-point scale)
    return (rating / 5) * 100;
  }

  // Calculate experience score
  calculateExperienceScore(isp) {
    const experience = isp.experience_years || 0;
    const maxExperience = 20; // Cap at 20 years
    return Math.min((experience / maxExperience) * 100, 100);
  }

  // Calculate workload score (lower is better)
  async calculateWorkloadScore(isp) {
    const jobs = await ISP.getJobs(isp.id);
    const activeJobs = jobs.filter(job => 
      ['new', 'assigned', 'in_progress'].includes(job.status)
    ).length;
    
    // Lower active jobs = higher score
    const maxJobs = 10;
    return Math.max(0, (1 - (activeJobs / maxJobs)) * 100);
  }

  // Deduplicate ISPs
  deduplicateISPs(isps) {
    const seen = new Set();
    return isps.filter(isp => {
      if (seen.has(isp.id)) return false;
      seen.add(isp.id);
      return true;
    });
  }

  // Calculate confidence in matching
  calculateConfidence(matches, jobData) {
    if (matches.length === 0) return 0;
    if (matches.length === 1) return matches[0].score / 100;
    
    // If we have multiple good matches, confidence is higher
    const avgScore = matches.reduce((sum, match) => sum + match.score, 0) / matches.length;
    const scoreSpread = Math.max(...matches.map(m => m.score)) - Math.min(...matches.map(m => m.score));
    
    // Higher average score and lower spread = higher confidence
    return (avgScore / 100) * (1 - (scoreSpread / 100));
  }

  // Get alternative strategies if no good matches
  getAlternativeStrategies(jobData, availableCount) {
    const strategies = [];
    
    if (availableCount === 0) {
      strategies.push({
        type: 'expand_search',
        description: 'Expand search to nearby regions',
        priority: 'high'
      });
      strategies.push({
        type: 'offer_incentive',
        description: 'Offer increased payment to attract distant ISPs',
        priority: 'medium'
      });
    } else if (availableCount < 3) {
      strategies.push({
        type: 'relax_requirements',
        description: 'Consider ISPs with lower skill match scores',
        priority: 'medium'
      });
    }
    
    if (jobData.urgency >= 4) {
      strategies.push({
        type: 'increase_urgency',
        description: 'Flag as urgent to prioritize assignment',
        priority: 'high'
      });
    }
    
    return strategies;
  }

  // Get recommended ISPs for a job
  async getRecommendedISPs(jobId) {
    try {
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      const matchResult = await this.matchISPForJob({
        category: job.category,
        location: job.address,
        urgency: this.mapPriorityToUrgency(job.priority),
        complexity: 3, // Default complexity
        description: job.description
      });

      return matchResult;
    } catch (error) {
      logger.error('Get recommended ISPs error:', error);
      throw error;
    }
  }

  // Map priority string to urgency number
  mapPriorityToUrgency(priority) {
    const priorityMap = {
      'low': 1,
      'normal': 2,
      'high': 3,
      'urgent': 4,
      'emergency': 5
    };
    return priorityMap[priority] || 2;
  }

  // Assign ISP to job with intelligent selection
  async assignBestISP(jobId) {
    try {
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      const matchResult = await this.getRecommendedISPs(jobId);
      
      if (matchResult.matches.length === 0) {
        throw new Error('No suitable ISPs found for this job');
      }

      // Select best match
      const bestISP = matchResult.matches[0];
      
      // Assign the ISP
      const updatedJob = await Job.assignISP(jobId, bestISP.id);
      
      logger.info('ISP assigned to job', {
        jobId,
        ispId: bestISP.id,
        ispName: bestISP.trade,
        score: bestISP.score
      });

      return {
        job: updatedJob,
        assignedISP: bestISP,
        alternatives: matchResult.matches.slice(1),
        confidence: matchResult.confidence
      };
    } catch (error) {
      logger.error('Assign best ISP error:', error);
      throw error;
    }
  }

  // Get ISP availability for a date range
  async getISPAvailability(ispId, startDate, endDate) {
    try {
      const isp = await ISP.findById(ispId);
      if (!isp) {
        throw new Error('ISP not found');
      }

      const jobs = await ISP.getJobs(ispId);
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      // Filter jobs in date range
      const jobsInRange = jobs.filter(job => {
        const jobDate = new Date(job.scheduled_date);
        return jobDate >= startDateObj && jobDate <= endDateObj;
      });

      // Calculate availability slots
      const totalSlots = 8; // Assuming 8 working hours per day
      const usedSlots = jobsInRange.reduce((total, job) => {
        const estimatedHours = 4; // Simplified estimation
        return total + estimatedHours;
      }, 0);

      const availableSlots = Math.max(0, totalSlots - usedSlots);

      return {
        ispId,
        ispName: isp.trade,
        startDate,
        endDate,
        totalSlots,
        usedSlots,
        availableSlots,
        isAvailable: availableSlots > 0,
        jobsInRange
      };
    } catch (error) {
      logger.error('Get ISP availability error:', error);
      throw error;
    }
  }

  // Bulk ISP matching for multiple jobs
  async bulkMatchISP(jobs) {
    try {
      const matchResults = await Promise.all(
        jobs.map(job => this.matchISPForJob({
          category: job.category,
          location: job.address,
          urgency: this.mapPriorityToUrgency(job.priority),
          complexity: 3,
          description: job.description
        }))
      );

      return {
        totalJobs: jobs.length,
        successfulMatches: matchResults.filter(r => r.matches.length > 0).length,
        matchResults
      };
    } catch (error) {
      logger.error('Bulk ISP matching error:', error);
      throw error;
    }
  }
}

module.exports = new MatchingService();