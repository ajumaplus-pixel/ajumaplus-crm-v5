const Job = require('../models/Job');
const ISP = require('../models/ISP');
const { cache, cacheKeys, cacheTTL } = require('../config/redis');
const { logger } = require('../utils/logger');

class AnalyticsService {
  // Demand forecasting
  async forecastDemand(category, location, days = 30) {
    try {
      const cacheKey = `forecast:${category}:${location}:${days}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug('Demand forecast cache hit', { cacheKey });
        return cached;
      }

      // Get historical job data
      const historicalJobs = await Job.getByStatus('completed');
      const categoryJobs = historicalJobs.filter(job => job.category === category);
      
      // Simple trend analysis
      const dailyJobCounts = this.groupJobsByDay(categoryJobs, days);
      const forecast = this.calculateTrend(dailyJobCounts);
      
      const result = {
        category,
        location,
        forecastPeriod: `${days} days`,
        forecast,
        historicalData: {
          totalJobs: categoryJobs.length,
          averageDaily: categoryJobs.length / days,
          trend: forecast.trend
        },
        confidence: 0.75 // Simplified confidence score
      };
      
      await cache.set(cacheKey, result, cacheTTL.medium);
      
      logger.info('Demand forecast completed', {
        category,
        location,
        days,
        trend: forecast.trend
      });
      
      return result;
    } catch (error) {
      logger.error('Demand forecast error:', error);
      throw error;
    }
  }

  // Revenue projection
  async projectRevenue(days = 30) {
    try {
      const jobs = await Job.getAll(days * 10, 0);
      const completedJobs = jobs.filter(job => job.status === 'completed');
      
      // Calculate average revenue per job
      const avgRevenue = completedJobs.length > 0 
        ? 300 // Simplified average
        : 250;
      
      const currentRevenue = completedJobs.length * avgRevenue;
      const dailyRate = currentRevenue / Math.max(1, days);
      
      // Project future revenue
      const projectedRevenue = dailyRate * days;
      
      const result = {
        currentRevenue,
        projectedRevenue,
        dailyRate,
        growthRate: 0.1, // 10% growth assumption
        completedJobs: completedJobs.length,
        totalJobs: jobs.length
      };
      
      logger.info('Revenue projection completed', {
        currentRevenue,
        projectedRevenue,
        days
      });
      
      return result;
    } catch (error) {
      logger.error('Revenue projection error:', error);
      throw error;
    }
  }

  // Job completion time estimation
  async estimateCompletionTime(category, complexity, location) {
    try {
      const jobs = await Job.getByStatus('completed');
      const categoryJobs = jobs.filter(job => job.category === category);
      
      // Calculate average completion time
      const completionTimes = categoryJobs.map(job => {
        const created = new Date(job.created_at);
        const completed = new Date(job.completed_date || job.updated_at);
        return (completed - created) / (1000 * 60 * 60); // hours
      });
      
      const avgCompletionTime = completionTimes.length > 0 
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length 
        : 24; // Default 24 hours
      
      // Adjust for complexity
      const complexityMultiplier = 1 + (complexity / 5);
      const estimatedTime = avgCompletionTime * complexityMultiplier;
      
      return {
        category,
        complexity,
        location,
        estimatedHours: Math.round(estimatedTime),
        estimatedDays: Math.round(estimatedTime / 8),
        confidence: 0.8,
        historicalJobs: categoryJobs.length
      };
    } catch (error) {
      logger.error('Completion time estimation error:', error);
      throw error;
    }
  }

  // Churn prediction (simplified)
  async predictChurn(customerId) {
    try {
      // Get customer job history
      const customerJobs = await Job.getByCustomerId(customerId);
      
      const factors = {
        jobFrequency: customerJobs.length,
        lastJobDays: customerJobs.length > 0 
          ? (Date.now() - new Date(customerJobs[0].created_at)) / (1000 * 60 * 60 * 24)
          : 999,
        avgUrgency: customerJobs.length > 0
          ? customerJobs.reduce((sum, job) => sum + (job.priority === 'urgent' ? 1 : 0), 0) / customerJobs.length
          : 0,
        satisfactionScore: 0.8 // Simplified
      };
      
      // Calculate churn risk
      let churnRisk = 'low';
      if (factors.lastJobDays > 90 && factors.jobFrequency < 2) {
        churnRisk = 'high';
      } else if (factors.lastJobDays > 60 && factors.jobFrequency < 3) {
        churnRisk = 'medium';
      }
      
      return {
        customerId,
        churnRisk,
        factors,
        confidence: 0.7
      };
    } catch (error) {
      logger.error('Churn prediction error:', error);
      throw error;
    }
  }

  // Customer lifetime value estimation
  async estimateCLV(customerId) {
    try {
      const churnPrediction = await this.predictChurn(customerId);
      const customerJobs = await Job.getByCustomerId(customerId);
      
      // Calculate revenue from jobs
      const totalRevenue = customerJobs.length * 300; // Simplified avg revenue
      
      // Project based on churn risk
      const multiplier = churnPrediction.churnRisk === 'low' ? 24 : 
                          churnPrediction.churnRisk === 'medium' ? 12 : 6;
      
      const clv = totalRevenue * multiplier;
      
      return {
        customerId,
        clv,
        churnRisk: churnPrediction.churnRisk,
        totalRevenue,
        projectionPeriod: `${multiplier} months`,
        confidence: 0.65
      };
    } catch (error) {
      logger.error('CLV estimation error:', error);
      throw error;
    }
  }

  // Peak period prediction
  async predictPeakPeriods(category, days = 90) {
    try {
      const jobs = await Job.getAll(days * 10, 0);
      const categoryJobs = jobs.filter(job => job.category === category);
      
      // Group by day of week
      const dayOfWeekCounts = {};
      categoryJobs.forEach(job => {
        const dayOfWeek = new Date(job.created_at).getDay();
        dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;
      });
      
      // Find peak day
      const peakDay = Object.entries(dayOfWeekCounts)
        .sort((a, b) => b[1] - a[1])[0];
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      return {
        category,
        peakDay: dayNames[parseInt(peakDay[0])],
        dayOfWeekCounts,
        peakJobs: peakDay[1],
        confidence: 0.7
      };
    } catch (error) {
      logger.error('Peak period prediction error:', error);
      throw error;
    }
  }

  // Helper: Group jobs by day
  groupJobsByDay(jobs, days) {
    const dailyCounts = {};
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyCounts[dateKey] = 0;
    }
    
    jobs.forEach(job => {
      const dateKey = new Date(job.created_at).toISOString().split('T')[0];
      if (dailyCounts.hasOwnProperty(dateKey)) {
        dailyCounts[dateKey]++;
      }
    });
    
    return dailyCounts;
  }

  // Helper: Calculate trend
  calculateTrend(dailyCounts) {
    const values = Object.values(dailyCounts);
    if (values.length < 2) return { trend: 'stable', growthRate: 0 };
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const growthRate = ((avgSecond - avgFirst) / Math.max(avgFirst, 1)) * 100;
    
    return {
      trend: growthRate > 5 ? 'increasing' : growthRate < -5 ? 'decreasing' : 'stable',
      growthRate: Math.round(growthRate * 10) / 10,
      avgFirst,
      avgSecond
    };
  }

  // Get overall analytics dashboard data
  async getDashboardData() {
    try {
      const allJobs = await Job.getAll(100, 0);
      const allISPs = await ISP.getAll(100, 0);
      
      const statusCounts = {
        new: allJobs.filter(j => j.status === 'new').length,
        assigned: allJobs.filter(j => j.status === 'assigned').length,
        in_progress: allJobs.filter(j => j.status === 'in_progress').length,
        completed: allJobs.filter(j => j.status === 'completed').length,
        cancelled: allJobs.filter(j => j.status === 'cancelled').length
      };
      
      const categoryCounts = {};
      allJobs.forEach(job => {
        categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
      });
      
      const ispAvailability = {
        total: allISPs.length,
        available: allISPs.filter(isp => isp.availability === 'available').length,
        busy: allISPs.filter(isp => isp.availability === 'busy').length
      };
      
      const revenueData = await this.projectRevenue(30);
      
      return {
        totalJobs: allJobs.length,
        statusCounts,
        categoryCounts,
        ispAvailability,
        revenueData,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Dashboard data error:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();