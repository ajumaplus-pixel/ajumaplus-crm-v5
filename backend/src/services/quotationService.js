const Quotation = require('../models/Quotation');
const Job = require('../models/Job');
const aiService = require('./aiService');
const { cache, cacheKeys, cacheTTL } = require('../config/redis');
const { logger } = require('../utils/logger');

class QuotationService {
  // Generate quotation from job automatically
  async generateQuotationFromJob(jobId, createdById) {
    try {
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // Use AI to analyze job and calculate pricing
      const jobData = {
        description: job.description,
        category: job.category,
        location: job.address,
        urgency: this.mapPriorityToUrgency(job.priority),
        complexity: 3 // Default complexity
      };

      const aiAnalysis = await aiService.analyzeJobFull(jobData);
      
      // Get available ISPs for pricing context
      const ISP = require('../models/ISP');
      const availableISPs = await ISP.getAvailableByLocation(job.address);
      
      // Calculate enhanced pricing
      const pricing = await aiService.calculateEnhancedPricing(jobData, aiAnalysis, availableISPs);
      
      // Create quotation
      const quotation = await Quotation.create({
        job_id: jobId,
        labour_cost: pricing.labourCost,
        materials_cost: pricing.materialsCost,
        travel_cost: pricing.travelCost,
        experience_factor: pricing.breakdown.experienceFactor,
        complexity_factor: pricing.breakdown.aiComplexityFactor,
        urgency_factor: pricing.breakdown.urgencyFactor,
        total: pricing.total,
        notes: `AI-generated quotation based on job analysis. Confidence: ${pricing.aiInsights.confidence}`,
        created_by: createdById
      });

      logger.info('Quotation generated from job', {
        jobId,
        quotationId: quotation.id,
        total: pricing.total
      });

      return {
        quotation,
        pricing,
        aiAnalysis
      };
    } catch (error) {
      logger.error('Generate quotation from job error:', error);
      throw error;
    }
  }

  // Compare multiple quotations
  async compareQuotations(quotationIds) {
    try {
      const quotations = await Promise.all(
        quotationIds.map(id => Quotation.findById(id))
      );

      const validQuotations = quotations.filter(q => q !== null);

      if (validQuotations.length === 0) {
        throw new Error('No valid quotations found');
      }

      // Sort by total price
      validQuotations.sort((a, b) => a.total - b.total);

      const comparison = {
        quotations: validQuotations,
        lowest: validQuotations[0],
        highest: validQuotations[validQuotations.length - 1],
        average: validQuotations.reduce((sum, q) => sum + q.total, 0) / validQuotations.length,
        range: validQuotations[validQuotations.length - 1].total - validQuotations[0].total
      };

      return comparison;
    } catch (error) {
      logger.error('Compare quotations error:', error);
      throw error;
    }
  }

  // Get quotation revision history
  async getQuotationHistory(jobId) {
    try {
      const quotations = await Quotation.findByJobId(jobId);
      
      const history = quotations.map(q => ({
        id: q.id,
        quotation_number: q.quotation_number,
        status: q.status,
        total: q.total,
        created_at: q.created_at,
        updated_at: q.updated_at,
        notes: q.notes
      }));

      return {
        jobId,
        totalRevisions: history.length,
        history
      };
    } catch (error) {
      logger.error('Get quotation history error:', error);
      throw error;
    }
  }

  // Revise quotation
  async reviseQuotation(quotationId, revisionData, revisedBy) {
    try {
      const existingQuotation = await Quotation.findById(quotationId);
      if (!existingQuotation) {
        throw new Error('Quotation not found');
      }

      if (existingQuotation.status === 'approved') {
        throw new Error('Cannot revise an approved quotation');
      }

      // Create new quotation revision
      const revisedQuotation = await Quotation.create({
        job_id: existingQuotation.job_id,
        labour_cost: revisionData.labour_cost || existingQuotation.labour_cost,
        materials_cost: revisionData.materials_cost || existingQuotation.materials_cost,
        travel_cost: revisionData.travel_cost || existingQuotation.travel_cost,
        experience_factor: revisionData.experience_factor || existingQuotation.experience_factor,
        complexity_factor: revisionData.complexity_factor || existingQuotation.complexity_factor,
        urgency_factor: revisionData.urgency_factor || existingQuotation.urgency_factor,
        total: revisionData.total || existingQuotation.total,
        notes: `Revision of ${existingQuotation.quotation_number}. ${revisionData.notes || ''}`,
        created_by: revisedBy
      });

      // Mark old quotation as superseded
      await Quotation.update(quotationId, {
        notes: `${existingQuotation.notes || ''} (Superseded by ${revisedQuotation.quotation_number})`
      });

      logger.info('Quotation revised', {
        originalId: quotationId,
        newId: revisedQuotation.id,
        revisedBy
      });

      return {
        original: existingQuotation,
        revised: revisedQuotation
      };
    } catch (error) {
      logger.error('Revise quotation error:', error);
      throw error;
    }
  }

  // Check quotation expiration
  async checkQuotationExpiration(quotationId) {
    try {
      const quotation = await Quotation.findById(quotationId);
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      const createdDate = new Date(quotation.created_at);
      const expirationDays = 7; // 7 days validity
      const expirationDate = new Date(createdDate);
      expirationDate.setDate(expirationDate.getDate() + expirationDays);

      const now = new Date();
      const isExpired = now > expirationDate;
      const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

      return {
        quotationId,
        createdDate: quotation.created_at,
        expirationDate: expirationDate.toISOString(),
        isExpired,
        daysUntilExpiration: Math.max(0, daysUntilExpiration),
        status: isExpired ? 'expired' : quotation.status
      };
    } catch (error) {
      logger.error('Check quotation expiration error:', error);
      throw error;
    }
  }

  // Get quotation workflow status
  async getWorkflowStatus(jobId) {
    try {
      const quotations = await Quotation.findByJobId(jobId);
      const job = await Job.findById(jobId);

      const latestQuotation = quotations[0];
      
      let workflowStage = 'no_quotation';
      if (latestQuotation) {
        switch (latestQuotation.status) {
          case 'draft':
            workflowStage = 'awaiting_review';
            break;
          case 'approved':
            workflowStage = 'approved';
            break;
          case 'rejected':
            workflowStage = 'rejected';
            break;
          default:
            workflowStage = 'in_progress';
        }
      }

      return {
        jobId,
        workflowStage,
        quotationCount: quotations.length,
        latestQuotation: latestQuotation || null,
        jobStatus: job?.status
      };
    } catch (error) {
      logger.error('Get workflow status error:', error);
      throw error;
    }
  }

  // Send quotation to customer (email notification)
  async sendQuotationToCustomer(quotationId) {
    try {
      const quotation = await Quotation.findById(quotationId);
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      const job = await Job.findById(quotation.job_id);
      if (!job) {
        throw new Error('Job not found');
      }

      // In production, this would send an email via the email service
      // For now, we'll just log the action
      logger.info('Quotation sent to customer', {
        quotationId,
        jobId: quotation.job_id,
        customerId: job.customer_id,
        total: quotation.total
      });

      return {
        success: true,
        message: 'Quotation sent to customer',
        quotationId,
        customerId: job.customer_id
      };
    } catch (error) {
      logger.error('Send quotation to customer error:', error);
      throw error;
    }
  }

  // Map priority to urgency number
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

  // Get quotation statistics
  async getQuotationStats() {
    try {
      const allQuotations = await Quotation.getAll(1000, 0);
      
      const stats = {
        total: allQuotations.length,
        byStatus: {
          draft: allQuotations.filter(q => q.status === 'draft').length,
          approved: allQuotations.filter(q => q.status === 'approved').length,
          rejected: allQuotations.filter(q => q.status === 'rejected').length
        },
        totalValue: allQuotations.reduce((sum, q) => sum + q.total, 0),
        averageValue: allQuotations.length > 0 
          ? allQuotations.reduce((sum, q) => sum + q.total, 0) / allQuotations.length 
          : 0,
        approvalRate: allQuotations.length > 0
          ? (allQuotations.filter(q => q.status === 'approved').length / allQuotations.length) * 100
          : 0
      };

      return stats;
    } catch (error) {
      logger.error('Get quotation stats error:', error);
      throw error;
    }
  }
}

module.exports = new QuotationService();