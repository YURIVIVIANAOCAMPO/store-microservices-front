import { defineStore } from 'pinia';
import api, { inventoryApi } from '../api';

const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    pagination: { totalPages: 0, totalElements: 0, size: 10, number: 0 },
    loading: false,
    error: null,
    inventory: {}, // Map of productId -> stock
    cache: {
      data: null,
      timestamp: null,
      filters: null
    }
  }),

  actions: {
    async fetchProducts(params = {}, force = false) {
      const filterKey = JSON.stringify(params);
      
      if (!force && this.cache.data && this.cache.filters === filterKey) {
        if (Date.now() - this.cache.timestamp < CACHE_EXPIRATION_MS) {
          this.products = this.cache.data.content;
          this.pagination = { ...this.cache.data, content: undefined };
          return;
        }
      }

      this.loading = true;
      this.error = null;
      try {
        const res = await api.get('/products', { params });
        const data = res.data.data;
        this.products = data.content;
        this.pagination = { ...data, content: undefined };
        this.cache = { data, timestamp: Date.now(), filters: filterKey };
      } catch (err) {
        this.error = err.friendlyMessage;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchStock(productId) {
      // El stock ya viene en la lista de productos (/products).
      // Solo llamamos a este metodo si necesitamos refrescar un producto individual.
      try {
        const res = await api.get(`/products/${productId}`);
        const product = res.data.data;
        this.inventory[productId] = product.stock ?? 0;
        
        // Tambien actualizamos el producto en la lista si existe
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          this.products[index].stock = product.stock;
        }
      } catch (err) {
        console.error("Error fetching individual stock", err);
      }
    },

    async purchaseProduct(productId, quantity) {
      this.loading = true;
      try {
        await api.post(`/products/${productId}/purchase`, null, { 
          params: { quantity },
          headers: { 'Idempotency-Key': `buy-${productId}-${Date.now()}` }
        });
        
        this.cache.timestamp = null; // Invalidate cache
        await this.fetchStock(productId);
        return { success: true };
      } catch (err) {
        return { success: false, message: err.friendlyMessage };
      } finally {
        this.loading = false;
      }
    },

    async syncStock(productId, stock) {
      this.loading = true;
      try {
        await api.put(`/products/${productId}/stock`, null, {
          params: { quantity: stock }
        });
        this.cache.timestamp = null; // Invalidate cache
        await this.fetchStock(productId);
        return { success: true };
      } catch (err) {
        return { success: false, message: err.friendlyMessage };
      } finally {
        this.loading = false;
      }
    },

    // CRUD Actions
    async createProduct(productData) {
      this.loading = true;
      try {
        const res = await api.post('/products', productData);
        const newProduct = res.data.data;
        if (productData.initialStock > 0) {
          await this.syncStock(newProduct.id, productData.initialStock);
        }
        this.cache.timestamp = null; // Invalidate cache
        return { success: true };
      } catch (err) {
        return { success: false, message: err.friendlyMessage };
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id, productData) {
      this.loading = true;
      try {
        await api.put(`/products/${id}`, productData);
        this.cache.timestamp = null; // Invalidate cache
        return { success: true };
      } catch (err) {
        return { success: false, message: err.friendlyMessage };
      } finally {
        this.loading = false;
      }
    },

    async deleteProduct(id) {
      this.loading = true;
      try {
        await api.delete(`/products/${id}`);
        this.cache.timestamp = null; // Invalidate cache
        return { success: true };
      } catch (err) {
        return { success: false, message: err.friendlyMessage };
      } finally {
        this.loading = false;
      }
    }
  }
});
