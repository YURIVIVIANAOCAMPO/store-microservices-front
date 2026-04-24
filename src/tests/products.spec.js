import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProductStore } from '../src/stores/products';
import api from '../src/api';

// Mock axios/api
vi.mock('../src/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Products Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetches products and updates state', async () => {
    const store = useProductStore();
    const mockData = {
      data: {
        data: {
          content: [{ id: '1', name: 'Test Product', price: 10, status: 'ACTIVE' }],
          totalPages: 1,
          totalElements: 1,
          size: 10,
          number: 0
        }
      }
    };
    
    vi.mocked(api.get).mockResolvedValue(mockData);

    await store.fetchProducts();

    expect(store.products).toHaveLength(1);
    expect(store.products[0].name).toBe('Test Product');
    expect(store.loading).toBe(false);
  });

  it('uses cache when available and not expired', async () => {
    const store = useProductStore();
    store.cache = {
      data: { content: [{ id: '1', name: 'Cached' }], totalPages: 1 },
      timestamp: Date.now(),
      filters: JSON.stringify({})
    };

    await store.fetchProducts();

    expect(api.get).not.toHaveBeenCalled();
    expect(store.products[0].name).toBe('Cached');
  });

  it('handles purchase errors with friendly messages', async () => {
    const store = useProductStore();
    vi.mocked(api.post).mockRejectedValue({
      friendlyMessage: 'Stock insufficient'
    });

    const result = await store.purchaseProduct('1', 100);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Stock insufficient');
  });
});
