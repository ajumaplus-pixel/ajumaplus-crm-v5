import api from './api';
import { Job, CreateJobData, ApiResponse } from '../types';

export const jobService = {
  // Get all jobs
  async getAllJobs(limit = 50, offset = 0): Promise<Job[]> {
    const response = await api.get<ApiResponse<Job[]>>(`/api/jobs?limit=${limit}&offset=${offset}`);
    return response.data.data;
  },

  // Get job by ID
  async getJobById(id: string): Promise<Job> {
    const response = await api.get<ApiResponse<Job>>(`/api/jobs/${id}`);
    return response.data.data;
  },

  // Create new job
  async createJob(jobData: CreateJobData): Promise<Job> {
    const response = await api.post<ApiResponse<Job>>('/api/jobs', jobData);
    return response.data.data;
  },

  // Update job
  async updateJob(id: string, jobData: Partial<CreateJobData>): Promise<Job> {
    const response = await api.put<ApiResponse<Job>>(`/api/jobs/${id}`, jobData);
    return response.data.data;
  },

  // Update job status
  async updateJobStatus(id: string, status: string): Promise<Job> {
    const response = await api.put<ApiResponse<Job>>(`/api/jobs/${id}/status`, { status });
    return response.data.data;
  },

  // Assign ISP to job
  async assignISP(id: string, ispId: string): Promise<Job> {
    const response = await api.put<ApiResponse<Job>>(`/api/jobs/${id}/assign`, { isp_id: ispId });
    return response.data.data;
  },

  // Add note to job
  async addNote(id: string, note: string): Promise<Job> {
    const response = await api.post<ApiResponse<Job>>(`/api/jobs/${id}/notes`, { note });
    return response.data.data;
  },

  // Delete job
  async deleteJob(id: string): Promise<void> {
    await api.delete(`/api/jobs/${id}`);
  },

  // Get jobs by customer
  async getJobsByCustomer(customerId: string): Promise<Job[]> {
    const response = await api.get<ApiResponse<Job[]>>(`/api/jobs/customer/${customerId}`);
    return response.data.data;
  },

  // Get jobs by ISP
  async getJobsByISP(ispId: string): Promise<Job[]> {
    const response = await api.get<ApiResponse<Job[]>>(`/api/jobs/isp/${ispId}`);
    return response.data.data;
  },

  // Get jobs by status
  async getJobsByStatus(status: string): Promise<Job[]> {
    const response = await api.get<ApiResponse<Job[]>>(`/api/jobs/status/${status}`);
    return response.data.data;
  },
};