import api from './api';
import { ApiResponse } from '../types';

export interface Rating {
  id: string;
  job_id: string;
  customer_id: string;
  isp_id: string;
  quality_rating: number;
  timeliness_rating: number;
  professionalism_rating: number;
  communication_rating: number;
  overall_rating: number;
  review?: string;
  isp_response?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRatingData {
  job_id: string;
  quality_rating: number;
  timeliness_rating: number;
  professionalism_rating: number;
  communication_rating: number;
  review?: string;
}

export const ratingService = {
  // Create rating for a job
  async createRating(ratingData: CreateRatingData): Promise<Rating> {
    const response = await api.post<ApiResponse<Rating>>('/api/ratings', ratingData);
    return response.data.data;
  },

  // Get rating by ID
  async getRatingById(ratingId: string): Promise<Rating> {
    const response = await api.get<ApiResponse<Rating>>(`/api/ratings/${ratingId}`);
    return response.data.data;
  },

  // Get rating by job
  async getRatingByJob(jobId: string): Promise<Rating> {
    const response = await api.get<ApiResponse<Rating>>(`/api/ratings/job/${jobId}`);
    return response.data.data;
  },

  // Update rating (within 24-hour window)
  async updateRating(ratingId: string, ratingData: Partial<CreateRatingData>): Promise<Rating> {
    const response = await api.put<ApiResponse<Rating>>(`/api/ratings/${ratingId}`, {
      quality_rating: ratingData.quality_rating,
      timeliness_rating: ratingData.timeliness_rating,
      professionalism_rating: ratingData.professionalism_rating,
      communication_rating: ratingData.communication_rating,
      review: ratingData.review,
    });
    return response.data.data;
  },

  // Get ISP ratings
  async getISPRatings(ispId: string): Promise<Rating[]> {
    const response = await api.get<ApiResponse<Rating[]>>(`/api/ratings/isp/${ispId}`);
    return response.data.data;
  },

  // Check if rating can be edited (within 24-hour window)
  async canEditRating(ratingId: string): Promise<{ canEdit: boolean; timeRemaining?: number }> {
    const response = await api.get<ApiResponse<{ canEdit: boolean; timeRemaining?: number }>>(`/api/ratings/${ratingId}/can-edit`);
    return response.data.data;
  },
};