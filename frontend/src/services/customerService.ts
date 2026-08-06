import api from './api';
import { Customer, Job, ApiResponse } from '../types';

export const customerService = {
  // Get customer profile by user ID
  async getCustomerByUserId(userId: string): Promise<Customer> {
    const response = await api.get<ApiResponse<Customer>>(`/api/customers/user/${userId}`);
    return response.data.data;
  },

  // Get customer profile by ID
  async getCustomerById(customerId: string): Promise<Customer> {
    const response = await api.get<ApiResponse<Customer>>(`/api/customers/${customerId}`);
    return response.data.data;
  },

  // Update customer profile
  async updateCustomer(customerId: string, updateData: Partial<Customer>): Promise<Customer> {
    const response = await api.put<ApiResponse<Customer>>(`/api/customers/${customerId}`, updateData);
    return response.data.data;
  },

  // Get customer jobs
  async getCustomerJobs(customerId: string, status?: string): Promise<Job[]> {
    const statusParam = status ? `?status=${status}` : '';
    const response = await api.get<ApiResponse<Job[]>>(`/api/jobs/customer/${customerId}${statusParam}`);
    return response.data.data;
  },

  // Convert guest customer to regular customer
  async convertGuestToCustomer(customerId: string, password: string, preferences?: any): Promise<Customer> {
    const response = await api.put<ApiResponse<Customer>>(`/api/customers/${customerId}/convert`, {
      password,
      preferences,
    });
    return response.data.data;
  },

  // Get customer statistics
  async getCustomerStats(customerId: string): Promise<{
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    totalSpent: number;
  }> {
    const response = await api.get<ApiResponse<any>>(`/api/customers/${customerId}/stats`);
    return response.data.data;
  },
};