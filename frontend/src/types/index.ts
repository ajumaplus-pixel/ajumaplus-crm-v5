// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'customer' | 'isp';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'staff' | 'customer' | 'isp';
}

// Job Types
export interface Job {
  id: string;
  job_number: string;
  customer_id: string;
  isp_id?: string;
  category: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  address: string;
  gps_coords?: string;
  scheduled_date?: string;
  completed_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobData {
  customer_id: string;
  category: string;
  description: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  address: string;
  gps_coords?: string;
  scheduled_date?: string;
  notes?: string;
}

// Quotation Types
export interface Quotation {
  id: string;
  quotation_number: string;
  job_id: string;
  labour_cost: string;
  materials_cost: string;
  travel_cost: string;
  experience_factor: string;
  complexity_factor: string;
  urgency_factor: string;
  total: string;
  status: 'draft' | 'approved' | 'rejected';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceEstimate {
  labourCost: number;
  materialsCost: number;
  travelCost: number;
  experienceFactor: number;
  ratingFactor: number;
  complexityFactor: number;
  urgencyFactor: number;
  total: number;
  breakdown: {
    baseLabour: number;
    complexityFactor: number;
    urgencyFactor: number;
    experienceFactor: number;
    ratingFactor: number;
  };
  aiAnalysis: any;
  availableISPs: number;
}

// Customer Types
export interface Customer {
  id: string;
  user_id: string;
  phone: string;
  address: string;
  gps_coords?: string;
  preferences: any;
  created_at: string;
  updated_at: string;
}

// ISP Types
export interface ISP {
  id: string;
  user_id: string;
  trade: string;
  location: string;
  gps_coords?: string;
  skills: string[];
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  jobs_completed: number;
  experience_years: number;
  certification: string[];
  payment_details?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}