import api from './api';
import { Quotation, PriceEstimate, ApiResponse } from '../types';

export const pricingService = {
  // Get price estimate for a job
  async estimatePrice(jobId: string, data: {
    category: string;
    description: string;
    urgency: number;
    complexity: number;
  }): Promise<PriceEstimate> {
    const response = await api.post<ApiResponse<PriceEstimate>>('/api/pricing/estimate', {
      job_id: jobId,
      ...data,
    });
    return response.data.data;
  },

  // Create quotation
  async createQuotation(quotationData: {
    job_id: string;
    labour_cost: number;
    materials_cost: number;
    travel_cost: number;
    experience_factor: number;
    complexity_factor: number;
    urgency_factor: number;
    total: number;
    notes?: string;
    created_by: string;
  }): Promise<Quotation> {
    const response = await api.post<ApiResponse<Quotation>>('/api/pricing/quotations', quotationData);
    return response.data.data;
  },

  // Get all quotations
  async getAllQuotations(limit = 50, offset = 0): Promise<Quotation[]> {
    const response = await api.get<ApiResponse<Quotation[]>>(`/api/pricing/quotations?limit=${limit}&offset=${offset}`);
    return response.data.data;
  },

  // Get quotation by ID
  async getQuotationById(id: string): Promise<Quotation> {
    const response = await api.get<ApiResponse<Quotation>>(`/api/pricing/quotations/${id}`);
    return response.data.data;
  },

  // Approve quotation
  async approveQuotation(id: string): Promise<Quotation> {
    const response = await api.put<ApiResponse<Quotation>>(`/api/pricing/quotations/${id}/approve`);
    return response.data.data;
  },

  // Reject quotation
  async rejectQuotation(id: string): Promise<Quotation> {
    const response = await api.put<ApiResponse<Quotation>>(`/api/pricing/quotations/${id}/reject`);
    return response.data.data;
  },

  // Get quotations by status
  async getQuotationsByStatus(status: string): Promise<Quotation[]> {
    const response = await api.get<ApiResponse<Quotation[]>>(`/api/pricing/quotations/status/${status}`);
    return response.data.data;
  },
};