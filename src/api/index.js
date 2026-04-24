import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry Logic Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Manual Retry logic for communication errors (timeouts, network issues)
    if (!response || error.code === 'ECONNABORTED') {
      config._retryCount = config._retryCount || 0;
      
      if (config._retryCount < MAX_RETRIES) {
        config._retryCount++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return api(config);
      }
    }

    // Clear error messages for specific status codes
    if (response) {
      const status = response.status;
      let message = 'An unexpected error occurred';

      switch (status) {
        case 401:
          message = 'Session expired. Please login again.';
          localStorage.removeItem('token');
          // We don't redirect here to avoid circular dependencies with router
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 409:
          message = response.data?.message || 'Conflict: Possible stock insufficiency.';
          break;
        case 422:
          message = response.data?.message || 'Unprocessable Entity: Validation failed.';
          break;
      }
      
      error.friendlyMessage = message;
    } else {
      error.friendlyMessage = 'Communication error: Please check your connection.';
    }

    return Promise.reject(error);
  }
);

export default api;
