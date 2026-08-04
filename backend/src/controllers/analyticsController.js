const analyticsService = require('../services/analyticsService');
const { logger } = require('../utils/logger');

class AnalyticsController {
  async getDemandForecast(req, res) {
    try {
      const { category, location, days } = req.query;
      
      const forecast = await analyticsService.forecastDemand(
        category,
        location,
        parseInt(days) || 30
      );
      
      res.status(200).json({
        success: true,
        data: forecast
      });
    } catch (error) {
      logger.error('Demand forecast error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get demand forecast', 
        error: error.message 
      });
    }
  }

  async getRevenueProjection(req, res) {
    try {
      const { days } = req.query;
      
      const projection = await analyticsService.projectRevenue(
        parseInt(days) || 30
      );
      
      res.status(200).json({
        success: true,
        data: projection
      });
    } catch (error) {
      logger.error('Revenue projection error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get revenue projection', 
        error: error.message 
      });
    }
  }

  async getCompletionTimeEstimate(req, res) {
    try {
      const { category, complexity, location } = req.query;
      
      const estimate = await analyticsService.estimateCompletionTime(
        category,
        parseInt(complexity) || 3,
        location
      );
      
      res.status(200).json({
        success: true,
        data: estimate
      });
    } catch (error) {
      logger.error('Completion time estimate error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get completion time estimate', 
        error: error.message 
      });
    }
  }

  async getChurnPrediction(req, res) {
    try {
      const { customer_id } = req.params;
      
      const prediction = await analyticsService.predictChurn(customer_id);
      
      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (error) {
      logger.error('Churn prediction error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get churn prediction', 
        error: error.message 
      });
    }
  }

  async getCLVEstimate(req, res) {
    try {
      const { customer_id } = req.params;
      
      const clv = await analyticsService.estimateCLV(customer_id);
      
      res.status(200).json({
        success: true,
        data: clv
      });
    } catch (error) {
      logger.error('CLV estimate error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get CLV estimate', 
        error: error.message 
      });
    }
  }

  async getPeakPeriods(req, res) {
    try {
      const { category, days } = req.query;
      
      const peakPeriods = await analyticsService.predictPeakPeriods(
        category,
        parseInt(days) || 90
      );
      
      res.status(200).json({
        success: true,
        data: peakPeriods
      });
    } catch (error) {
      logger.error('Peak periods prediction error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get peak periods prediction', 
        error: error.message 
      });
    }
  }

  async getDashboardData(req, res) {
    try {
      const dashboardData = await analyticsService.getDashboardData();
      
      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      logger.error('Dashboard data error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get dashboard data', 
        error: error.message 
      });
    }
  }
}

module.exports = new AnalyticsController();