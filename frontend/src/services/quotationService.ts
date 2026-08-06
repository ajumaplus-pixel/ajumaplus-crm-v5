import api from './api';
import { Quotation, ApiResponse } from '../types';

export const quotationService = {
  // Get quotation by ID
  async getQuotationById(quotationId: string): Promise<Quotation> {
    const response = await api.get<ApiResponse<Quotation>>(`/api/pricing/quotations/${quotationId}`);
    return response.data.data;
  },

  // Get quotations for a job
  async getQuotationsByJob(jobId: string): Promise<Quotation[]> {
    const response = await api.get<ApiResponse<Quotation[]>>(`/api/pricing/quotations/job/${jobId}`);
    return response.data.data;
  },

  // Accept quotation
  async acceptQuotation(quotationId: string): Promise<Quotation> {
    const response = await api.put<ApiResponse<Quotation>>(`/api/pricing/quotations/${quotationId}/approve`);
    return response.data.data;
  },

  // Reject quotation
  async rejectQuotation(quotationId: string, reason?: string): Promise<Quotation> {
    const response = await api.put<ApiResponse<Quotation>>(`/api/pricing/quotations/${quotationId}/reject`, { reason });
    return response.data.data;
  },

  // Request quotation revision
  async requestRevision(quotationId: string, revisionData: {
    labour_cost?: number;
    materials_cost?: number;
    notes?: string;
  }): Promise<Quotation> {
    const response = await api.post<ApiResponse<Quotation>>(`/api/pricing/quotations/${quotationId}/revise`, revisionData);
    return response.data.data;
  },

  // Get quotation history for a job
  async getQuotationHistory(jobId: string): Promise<Quotation[]> {
    const response = await api.get<ApiResponse<Quotation[]>>(`/api/pricing/quotations/job/${jobId}/history`);
    return response.data.data;
  },
};