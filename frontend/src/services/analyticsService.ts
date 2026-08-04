import api from './api';

export interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
}

export interface DemandForecast {
  category: string;
  location: string;
  forecastPeriod: string;
  forecast: {
    trend: string;
    growthRate: number;
    predictedJobs: number;
  };
  historicalData: {
    totalJobs: number;
    averageDaily: number;
    trend: string;
  };
  confidence: number;
}

export interface RevenueProjection {
  currentRevenue: number;
  projectedRevenue: number;
  dailyRate: number;
  growthRate: number;
  completedJobs: number;
  totalJobs: number;
}

export interface CompletionTimeEstimate {
  category: string;
  complexity: number;
  location: string;
  estimatedHours: number;
  estimatedDays: number;
  confidence: number;
  historicalJobs: number;
}

export interface ChurnPrediction {
  customerId: string;
  churnRisk: 'low' | 'medium' | 'high';
  factors: {
    jobFrequency: number;
    lastJobDays: number;
    avgUrgency: number;
    satisfactionScore: number;
  };
  confidence: number;
}

export interface CLVEstimate {
  customerId: string;
  clv: number;
  churnRisk: string;
  totalRevenue: number;
  projectionPeriod: string;
  confidence: number;
}

export interface PeakPeriods {
  category: string;
  peakDay: string;
  dayOfWeekCounts: Record<string, number>;
  peakJobs: number;
  confidence: number;
}

export interface DashboardStats {
  totalJobs: number;
  statusCounts: {
    new: number;
    assigned: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  categoryCounts: Record<string, number>;
  ispAvailability: {
    total: number;
    available: number;
    busy: number;
  };
  revenueData: {
    currentRevenue: number;
    projectedRevenue: number;
    growthRate: number;
  };
  lastUpdated: string;
}

export const analyticsService = {
  // Demand forecasting
  async getDemandForecast(category: string, location: string, days: number = 30): Promise<DemandForecast> {
    const response = await api.get<AnalyticsResponse<DemandForecast>>(
      `/api/analytics/forecast/demand?category=${category}&location=${location}&days=${days}`
    );
    return response.data.data;
  },

  // Revenue projection
  async getRevenueProjection(days: number = 30): Promise<RevenueProjection> {
    const response = await api.get<AnalyticsResponse<RevenueProjection>>(
      `/api/analytics/projection/revenue?days=${days}`
    );
    return response.data.data;
  },

  // Completion time estimation
  async getCompletionTimeEstimate(
    category: string,
    complexity: number,
    location: string
  ): Promise<CompletionTimeEstimate> {
    const response = await api.get<AnalyticsResponse<CompletionTimeEstimate>>(
      `/api/analytics/estimate/completion-time?category=${category}&complexity=${complexity}&location=${location}`
    );
    return response.data.data;
  },

  // Churn prediction
  async getChurnPrediction(customerId: string): Promise<ChurnPrediction> {
    const response = await api.get<AnalyticsResponse<ChurnPrediction>>(
      `/api/analytics/predict/churn/${customerId}`
    );
    return response.data.data;
  },

  // Customer lifetime value estimation
  async getCLVEstimate(customerId: string): Promise<CLVEstimate> {
    const response = await api.get<AnalyticsResponse<CLVEstimate>>(
      `/api/analytics/estimate/clv/${customerId}`
    );
    return response.data.data;
  },

  // Peak periods prediction
  async getPeakPeriods(category: string, days: number = 90): Promise<PeakPeriods> {
    const response = await api.get<AnalyticsResponse<PeakPeriods>>(
      `/api/analytics/predict/peak-periods?category=${category}&days=${days}`
    );
    return response.data.data;
  },

  // Dashboard analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<AnalyticsResponse<DashboardStats>>(
      '/api/analytics/dashboard'
    );
    return response.data.data;
  }
};