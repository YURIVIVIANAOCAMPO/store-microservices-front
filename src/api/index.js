import axios from 'axios';

// Base URLs
const PRODUCTS_URL = import.meta.env.VITE_PRODUCTS_URL || 'http://localhost:8080';
const INVENTORY_URL = import.meta.env.VITE_INVENTORY_URL || 'http://localhost:8081';

const api = axios.create({
  baseURL: PRODUCTS_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Specific instance for Inventory if needed, or just use full URLs
export const inventoryApi = axios.create({
  baseURL: INVENTORY_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'inventory-secret-key' // As seen in backend README
  },
});

// Retry Logic Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const setupInterceptors = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && instance === api) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      
      // Retry logic
      if (!response || error.code === 'ECONNABORTED') {
        config._retryCount = config._retryCount || 0;
        if (config._retryCount < MAX_RETRIES) {
          config._retryCount++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return instance(config);
        }
      }

      if (response) {
        const status = response.status;
        let message = response.data?.message || 'An unexpected error occurred';

        switch (status) {
          case 401:
            message = 'Sesión expirada. Por favor inicie sesión.';
            localStorage.removeItem('token');
            break;
          case 404:
            message = 'Recurso no encontrado.';
            break;
          case 409:
            message = response.data?.message || 'Conflicto: Stock insuficiente o duplicado.';
            break;
          case 422:
            message = response.data?.message || 'Error de validación.';
            break;
        }
        error.friendlyMessage = message;
      } else {
        error.friendlyMessage = 'Error de comunicación con el servidor. Reintentando...';
      }

      return Promise.reject(error);
    }
  );
};

setupInterceptors(api);
setupInterceptors(inventoryApi);

export default api;
