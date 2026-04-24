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
      try {
        // Assuming the endpoint exists based on standard patterns
        const res = await inventoryApi.get(`/inventory/${productId}`);
        this.inventory[productId] = res.data.data.quantity;
      } catch (err) {
        console.error('Failed to fetch stock', err);
        this.inventory[productId] = 'N/A';
      }
    },

    async purchaseProduct(productId, quantity) {
      this.loading = true;
      try {
        // Calling Inventory Service directly as per requirement
        await inventoryApi.post('/inventory/purchases', { 
          productId, 
          quantity 
        }, {
          headers: { 'Idempotency-Key': `buy-${productId}-${Date.now()}` }
        });
        
        this.cache.timestamp = null; // Invalidate cache
        await this.fetchStock(productId); // Update stock
        return { success: true };
      } catch (err) {
        return { 
          success: false, 
          message: err.friendlyMessage || 'Error al procesar la compra' 
        };
      } finally {
        this.loading = false;
      }
    }
  }
});
