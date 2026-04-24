import axios from 'axios';

const PRODUCTS_URL = import.meta.env.VITE_PRODUCTS_URL || '/api';
const INVENTORY_URL = import.meta.env.VITE_INVENTORY_URL || '/inventory-api';

const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
  });

  instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    response => response,
    async error => {
      const { response, config } = error;
      
      // Senior Plus: Manual Retry Logic (or automatic here)
      if (!response && config && !config._retry && config.method === 'get') {
        config._retry = true;
        // Simple 1s delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return instance(config);
      }

      // Standard Error Mapping (JSON:API style)
      let message = 'Ocurrió un error inesperado';
      if (response) {
        switch (response.status) {
          case 401: message = 'Usuario o contraseña incorrectos'; break;
          case 403: message = 'No tiene permisos para esta acción'; break;
          case 404: message = 'Recurso no encontrado'; break;
          case 409: message = 'Conflicto: El SKU o recurso ya existe'; break;
          case 422: message = 'Datos inválidos. Verifique el stock o campos'; break;
          case 500: message = 'Error interno del servidor'; break;
          default: message = response.data?.message || message;
        }
      } else {
        message = 'No se pudo conectar con el servidor. Verifique su conexión.';
      }
      
      error.friendlyMessage = message;
      error.statusCode = response?.status;
      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createInstance(PRODUCTS_URL);
export const inventoryApi = createInstance(INVENTORY_URL);

export default api;
