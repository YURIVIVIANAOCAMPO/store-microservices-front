import { defineStore } from 'pinia';
import api from '../api';

const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    pagination: { totalPages: 0, totalElements: 0, size: 10, number: 0 },
    loading: false,
    error: null,
    cache: {
      data: null,
      timestamp: null,
      filters: null
    }
  }),

  actions: {
    async fetchProducts(params = {}, force = false) {
      const filterKey = JSON.stringify(params);
      
      // Cache check
      if (!force && this.cache.data && this.cache.filters === filterKey) {
        const now = Date.now();
        if (now - this.cache.timestamp < CACHE_EXPIRATION_MS) {
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
        this.pagination = { 
          totalPages: data.totalPages, 
          totalElements: data.totalElements, 
          size: data.size, 
          number: data.number 
        };

        // Update cache
        this.cache = {
          data,
          timestamp: Date.now(),
          filters: filterKey
        };
      } catch (err) {
        this.error = err.friendlyMessage || 'Failed to fetch products';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async purchaseProduct(productId, quantity) {
      this.loading = true;
      try {
        await api.post(`/products/${productId}/purchase`, { quantity });
        // Invalidate cache after purchase as stock changed
        this.cache.timestamp = null;
        return { success: true };
      } catch (err) {
        return { 
          success: false, 
          message: err.friendlyMessage || 'Purchase failed' 
        };
      } finally {
        this.loading = false;
      }
    }
  }
});
