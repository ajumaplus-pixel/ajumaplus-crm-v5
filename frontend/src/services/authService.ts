import api from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>('/api/users/me');
    return response.data.data;
  },

  // Store auth data in localStorage
  storeAuthData(authData: AuthResponse): void {
    localStorage.setItem('token', authData.data.token);
    localStorage.setItem('refreshToken', authData.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.data.user));
  },

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};