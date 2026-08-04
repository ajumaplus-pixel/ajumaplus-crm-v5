// API Configuration for different environments
export const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3001/api',
  },
  production: {
    baseURL: 'https://your-backend-url.onrender.com/api',
  },
};

// Determine environment
const getApiConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return API_CONFIG.production;
  }
  return API_CONFIG.development;
};

export const API_BASE_URL = getApiConfig().baseURL;