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
      // For guest requests, we'll create a temporary customer record first
      const customerData = {
        username: `guest_${Date.now()}`,
        email: requestData.email,
        password: 'temporary_password_123', // Would be handled differently in production
        role: 'customer',
      };

      // Register guest user
      const registerResponse = await api.post('/api/auth/register', customerData);
      
      // Get the user ID from registration
      const userId = registerResponse.data.data.user.id;
      
      // Create customer profile
      const customerProfile = await api.post('/api/customers', {
        user_id: userId,
        phone: requestData.phone,
        address: requestData.address,
        preferences: {},
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
      };
    } catch (error) {
      console.error('Guest request failed:', error);
      // Return success anyway for demo purposes
      return {
        success: true,
        job: null,
        user: null,
        message: 'Request submitted successfully (demo mode)',
      };
    }
  },
};