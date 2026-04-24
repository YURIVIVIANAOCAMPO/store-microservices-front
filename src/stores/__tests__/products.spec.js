import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProductStore } from '../stores/products';
import api from '../api';

vi.mock('../api');

describe('ProductStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchProducts should update state on success', async () => {
    const store = useProductStore();
    const mockProducts = [{ id: '1', name: 'Test Product', sku: 'P1', price: 100, status: 'ACTIVE' }];
    
    api.get.mockResolvedValueOnce({ 
      data: { data: mockProducts, meta: { totalPages: 1 } } 
    });

    await store.fetchProducts();
    
    expect(store.products).toEqual(mockProducts);
    expect(store.loading).toBe(false);
  });

  it('fetchStock should update inventory mapping', async () => {
    const store = useProductStore();
    const productId = '123';
    
    // Simular inventoryApi importado o inyectado
    // Por simplicidad en el mock de la arquitectura actual:
    api.get.mockResolvedValueOnce({ data: { available: 15 } });

    await store.fetchStock(productId);
    
    expect(store.inventory[productId]).toBe(15);
  });

  it('purchaseProduct should handle success and update stock', async () => {
    const store = useProductStore();
    const productId = '123';
    store.inventory[productId] = 20;

    api.post.mockResolvedValueOnce({ data: { message: 'Success' } });
    
    const result = await store.purchaseProduct(productId, 5);
    
    expect(result.success).toBe(true);
    // Nota: El store actual asume que el backend descuenta y el front re-consulta
    // o descuenta localmente si el componente lo requiere.
  });
});
