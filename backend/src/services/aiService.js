const { analyzeJobDescription, openai } = require('../config/ai-config');
const { cache, cacheKeys, cacheTTL } = require('../config/redis');
const { logger } = require('../utils/logger');

// Enhanced AI pricing analysis
class AIService {
  // Comprehensive job analysis
  async analyzeJobFull(jobData) {
    const { description, category, location, urgency, complexity } = jobData;
    
    // Check cache first
    const cacheKey = `ai:full:${category}:${description.substring(0, 50)}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.debug('AI analysis cache hit', { cacheKey });
      return cached;
    }

    try {
      const analysis = await this.performComprehensiveAnalysis(jobData);
      
      // Cache the result
      await cache.set(cacheKey, analysis, cacheTTL.veryLong);
      
      return analysis;
    } catch (error) {
      logger.error('AI analysis failed:', error);
      return this.getFallbackAnalysis(jobData);
    }
  }

  // Perform comprehensive AI analysis
  async performComprehensiveAnalysis(jobData) {
    const { description, category, location, urgency, complexity } = jobData;

    const systemPrompt = `You are an expert service pricing analyst for AjumaPlus CRM in Ghana. 
    Analyze job descriptions and provide detailed pricing insights considering:
    - Ghana market rates and local economic factors
    - Regional pricing variations across Ghana
    - Seasonal demand patterns
    - Material availability and costs
    - Labor market conditions
    - Risk factors and contingencies
    Return as valid JSON only.`;

    const userPrompt = `Analyze this job request:
    Category: ${category}
    Location: ${location}
    Urgency: ${urgency} (1-5 scale)
    Complexity: ${complexity} (1-5 scale)
    Description: "${description}"

    Provide detailed analysis including:
    1. complexity_level (1-5 scale)
    2. required_skills (array of specific skills)
    3. estimated_time_hours (number)
    4. required_materials (array with item and estimated_cost)
    5. risk_factors (array of potential issues)
    6. seasonal_adjustment (percentage -10 to +10)
    7. regional_adjustment (percentage -15 to +15)
    8. market_rate_range (min and max in GHS)
    9. confidence_score (0-1)
    10. alternative_approaches (array of different methods)
    Return as valid JSON only.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      logger.info('AI analysis completed', {
        category,
        location,
        confidence: analysis.confidence_score
      });

      return analysis;
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw error;
    }
  }

  // Enhanced pricing calculation
  async calculateEnhancedPricing(jobData, aiAnalysis, availableISPs) {
    const { category, description, urgency, complexity, location } = jobData;
    
    // Base labor costs by category (Ghana market rates)
    const baseLabourCosts = {
      'electrical': 200,
      'plumbing': 180,
      'carpentry': 150,
      'painting': 120,
      'cleaning': 80,
      'air_conditioning': 250,
      'masonry': 180,
      'roofing': 220,
      'aluminium': 200,
      'general_repairs': 100,
      'generator': 300,
      'solar': 400,
      'security': 150
    };

    const baseLabour = baseLabourCosts[category] || 100;

    // AI-driven complexity factor
    const aiComplexityFactor = aiAnalysis?.complexity_level 
      ? 1 + (aiAnalysis.complexity_level / 10) 
      : 1 + (complexity / 10);

    // Urgency factor with AI insight
    const urgencyFactor = 1 + (urgency / 10);
    
    // AI seasonal adjustment
    const seasonalFactor = aiAnalysis?.seasonal_adjustment 
      ? 1 + (aiAnalysis.seasonal_adjustment / 100) 
      : 1.0;

    // AI regional adjustment
    const regionalFactor = aiAnalysis?.regional_adjustment 
      ? 1 + (aiAnalysis.regional_adjustment / 100) 
      : 1.0;

    // ISP experience factor
    const bestISP = availableISPs.length > 0 ? availableISPs[0] : null;
    const experienceFactor = bestISP 
      ? (1 + (bestISP.experience_years / 20)) 
      : 1.0;

    // ISP rating factor
    const ratingFactor = bestISP 
      ? (0.8 + (bestISP.rating / 25)) 
      : 1.0;

    // Risk factor from AI
    const riskFactor = aiAnalysis?.risk_factors?.length > 0 
      ? 1 + (aiAnalysis.risk_factors.length * 0.05) 
      : 1.0;

    // Materials cost from AI
    const materialsCost = aiAnalysis?.required_materials?.reduce((sum, item) => 
      sum + (item.estimated_cost || 0), 0) || 50;

    // Travel cost (simplified - would use Google Maps API in production)
    const travelCost = 30;

    // Calculate components
    const labourCost = baseLabour * aiComplexityFactor * urgencyFactor * 
                       seasonalFactor * regionalFactor * experienceFactor * ratingFactor;

    const riskAdjustment = (labourCost + materialsCost) * (riskFactor - 1);
    
    const total = labourCost + materialsCost + travelCost + riskAdjustment;

    // Price range based on AI market analysis
    const marketRange = aiAnalysis?.market_rate_range || { min: total * 0.8, max: total * 1.2 };

    return {
      labourCost: Math.round(labourCost * 100) / 100,
      materialsCost: Math.round(materialsCost * 100) / 100,
      travelCost: Math.round(travelCost * 100) / 100,
      riskAdjustment: Math.round(riskAdjustment * 100) / 100,
      total: Math.round(total * 100) / 100,
      priceRange: {
        min: Math.round(marketRange.min * 100) / 100,
        max: Math.round(marketRange.max * 100) / 100,
        recommended: Math.round(total * 100) / 100
      },
      breakdown: {
        baseLabour,
        aiComplexityFactor: Math.round(aiComplexityFactor * 100) / 100,
        urgencyFactor: Math.round(urgencyFactor * 100) / 100,
        seasonalFactor: Math.round(seasonalFactor * 100) / 100,
        regionalFactor: Math.round(regionalFactor * 100) / 100,
        experienceFactor: Math.round(experienceFactor * 100) / 100,
        ratingFactor: Math.round(ratingFactor * 100) / 100,
        riskFactor: Math.round(riskFactor * 100) / 100
      },
      aiInsights: {
        requiredSkills: aiAnalysis?.required_skills || [],
        estimatedTime: aiAnalysis?.estimated_time_hours || 4,
        riskFactors: aiAnalysis?.risk_factors || [],
        confidence: aiAnalysis?.confidence_score || 0.8,
        alternatives: aiAnalysis?.alternative_approaches || []
      },
      marketContext: {
        seasonalAdjustment: aiAnalysis?.seasonal_adjustment || 0,
        regionalAdjustment: aiAnalysis?.regional_adjustment || 0,
        marketRateRange: marketRange
      },
      availableISPs: availableISPs.length,
      jobData: {
        category,
        location,
        urgency,
        complexity
      }
    };
  }

  // Fallback analysis when AI fails
  getFallbackAnalysis(jobData) {
    const { category, complexity, urgency } = jobData;
    
    return {
      complexity_level: complexity || 3,
      required_skills: ['General skills'],
      estimated_time_hours: 4,
      required_materials: [{ item: 'Basic materials', estimated_cost: 50 }],
      risk_factors: ['Standard risks'],
      seasonal_adjustment: 0,
      regional_adjustment: 0,
      market_rate_range: { min: 100, max: 500 },
      confidence_score: 0.5,
      alternative_approaches: ['Standard approach']
    };
  }

  // AI-powered ISP matching insights
  async analyzeISPRequirements(jobData) {
    const { category, description, location } = jobData;

    const systemPrompt = `You are an expert in service provider matching for AjumaPlus CRM in Ghana.
    Analyze job requirements and provide ISP matching criteria.`;

    const userPrompt = `Analyze requirements for this job:
    Category: ${category}
    Location: ${location}
    Description: "${description}"

    Provide matching criteria including:
    1. required_skills (array of specific skills)
    2. preferred_experience_years (number)
    3. minimum_rating (1-5 scale)
    4. equipment_requirements (array)
    5. availability_requirements (array)
    6. location_preferences (array of nearby areas)
    7. urgency_level (low, medium, high)
    Return as valid JSON only.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const matchingCriteria = JSON.parse(response.choices[0].message.content);
      
      logger.info('ISP matching analysis completed', {
        category,
        location,
        urgency: matchingCriteria.urgency_level
      });

      return matchingCriteria;
    } catch (error) {
      logger.error('ISP matching analysis failed:', error);
      return this.getFallbackMatchingCriteria(jobData);
    }
  }

  // Fallback matching criteria
  getFallbackMatchingCriteria(jobData) {
    const { category } = jobData;
    
    return {
      required_skills: [category],
      preferred_experience_years: 2,
      minimum_rating: 3.0,
      equipment_requirements: ['Basic tools'],
      availability_requirements: ['Available during work hours'],
      location_preferences: [jobData.location],
      urgency_level: 'medium'
    };
  }

  // AI-powered job completion prediction
  async predictJobCompletion(jobData, assignedISP) {
    const { category, description, complexity, urgency } = jobData;
    const { experience_years, rating, skills } = assignedISP;

    const systemPrompt = `You are an expert in service delivery estimation for AjumaPlus CRM in Ghana.
    Predict job completion time and success probability.`;

    const userPrompt = `Predict completion for this job:
    Category: ${category}
    Complexity: ${complexity} (1-5)
    Urgency: ${urgency} (1-5)
    Description: "${description}"
    
    Assigned ISP:
    Experience: ${experience_years} years
    Rating: ${rating}/5
    Skills: ${skills?.join(', ') || 'General'}

    Provide prediction including:
    1. estimated_completion_hours (number)
    2. success_probability (0-1)
    3. potential_delays (array of risk factors)
    4. quality_score (1-5)
    5. recommended_actions (array)
    Return as valid JSON only.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const prediction = JSON.parse(response.choices[0].message.content);
      
      logger.info('Job completion prediction completed', {
        category,
        success_probability: prediction.success_probability
      });

      return prediction;
    } catch (error) {
      logger.error('Job completion prediction failed:', error);
      return this.getFallbackPrediction(jobData, assignedISP);
    }
  }

  // Fallback prediction
  getFallbackPrediction(jobData, assignedISP) {
    const { complexity, urgency } = jobData;
    const { experience_years, rating } = assignedISP;

    const baseHours = 4;
    const complexityHours = complexity * 0.5;
    const experienceBonus = experience_years * 0.1;
    const urgencyBonus = urgency * 0.2;

    const estimatedHours = baseHours + complexityHours - experienceBonus + urgencyBonus;
    const successProbability = Math.min(0.95, 0.7 + (rating * 0.05) + (experience_years * 0.01));

    return {
      estimated_completion_hours: Math.max(1, estimatedHours),
      success_probability: successProbability,
      potential_delays: ['Standard delays possible'],
      quality_score: rating,
      recommended_actions: ['Monitor progress', 'Communicate regularly']
    };
  }

  // AI-powered customer insights
  async analyzeCustomerBehavior(customerData, jobHistory) {
    const { registration_date, location, preferences } = customerData;

    const systemPrompt = `You are an expert in customer behavior analysis for AjumaPlus CRM in Ghana.
    Analyze customer patterns and provide insights.`;

    const userPrompt = `Analyze customer behavior:
    Customer Location: ${location}
    Registration Date: ${registration_date}
    Preferences: ${JSON.stringify(preferences)}
    Job History: ${JSON.stringify(jobHistory.slice(0, 10))}

    Provide insights including:
    1. service_preferences (array of preferred categories)
    2. engagement_level (low, medium, high)
    3. loyalty_score (0-1)
    4. price_sensitivity (low, medium, high)
    5. preferred_contact_method
    6. churn_risk (low, medium, high)
    7. upsell_opportunities (array)
    Return as valid JSON only.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: "json_object" }
      });

      const insights = JSON.parse(response.choices[0].message.content);
      
      logger.info('Customer behavior analysis completed', {
        location,
        engagement_level: insights.engagement_level
      });

      return insights;
    } catch (error) {
      logger.error('Customer behavior analysis failed:', error);
      return this.getFallbackCustomerInsights(customerData, jobHistory);
    }
  }

  // Fallback customer insights
  getFallbackCustomerInsights(customerData, jobHistory) {
    const { location } = customerData;

    return {
      service_preferences: ['general_repairs'],
      engagement_level: jobHistory.length > 5 ? 'high' : 'medium',
      loyalty_score: 0.7,
      price_sensitivity: 'medium',
      preferred_contact_method: 'email',
      churn_risk: 'medium',
      upsell_opportunities: ['Premium services']
    };
  }
}

module.exports = new AIService();