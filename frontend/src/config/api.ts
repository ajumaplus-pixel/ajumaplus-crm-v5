// API Configuration for different environments
const getApiBaseUrl = () => {
  // Check for environment variable first (for production)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Development fallback
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;