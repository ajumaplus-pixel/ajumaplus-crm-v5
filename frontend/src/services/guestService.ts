// Guest job creation service for public requests
import api from './api';

export const guestService = {
  // Submit guest job request
  async submitGuestRequest(requestData: {
    customer_name: string;
    phone: string;
    email: string;
    address: string;
    category: string;
    description: string;
    priority: string;
  }) {
    try {
      // Validate required fields
      if (!requestData.customer_name || !requestData.phone || !requestData.email || 
          !requestData.address || !requestData.category || !requestData.description) {
        throw new Error('All required fields must be provided');
      }

      // For guest requests, we'll create a temporary customer record first
      const customerData = {
        username: `guest_${Date.now()}`,
        email: requestData.email,
        password: this.generateTemporaryPassword(),
        role: 'customer',
      };

      // Register guest user
      const registerResponse = await api.post('/api/auth/register', customerData);
      
      // Get the user ID from registration
      const userId = registerResponse.data.data.user.id;
      
      // Create guest customer profile
      const customerProfile = await api.post('/api/customers/guest', {
        user_id: userId,
        phone: requestData.phone,
        address: requestData.address,
        preferences: {
          is_guest: true,
          guest_name: requestData.customer_name,
        },
      });

      // Create job using the customer ID
      const jobData = {
        customer_id: customerProfile.data.data.id,
        category: requestData.category,
        description: requestData.description,
        priority: requestData.priority,
        address: requestData.address,
        notes: `Guest Request - Name: ${requestData.customer_name}, Phone: ${requestData.phone}, Email: ${requestData.email}`,
      };

      const jobResponse = await api.post('/api/jobs', jobData);
      
      return {
        success: true,
        job: jobResponse.data.data,
        user: registerResponse.data.data.user,
        message: 'Service request submitted successfully',
      };
    } catch (error: any) {
      console.error('Guest request failed:', error);
      
      // Handle specific error cases
      if (error.response) {
        // Backend returned an error
        throw new Error(error.response.data?.message || 'Failed to submit request. Please try again.');
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        throw new Error(error.message || 'An unexpected error occurred. Please try again.');
      }
    }
  },

  // Generate a secure temporary password
  generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },
};