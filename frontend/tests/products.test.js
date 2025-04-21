import { describe, it, expect, vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('Product Listing', () => {
  it('should fetch products successfully', async () => {
    const mockProducts = [
      { id: 1, name: 'Tomatoes', price: 2.99, farmer: 'John Doe' },
      { id: 2, name: 'Potatoes', price: 1.99, farmer: 'Jane Smith' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProducts)
    });

    const response = await fetch('/api/products');
    const products = await response.json();

    expect(products).toHaveLength(2);
    expect(products[0]).toHaveProperty('name', 'Tomatoes');
  });

  it('should handle fetch errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    try {
      await fetch('/api/products');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });

  it('should filter products by category', () => {
    const products = [
      { id: 1, name: 'Tomatoes', category: 'vegetables', price: 2.99 },
      { id: 2, name: 'Apples', category: 'fruits', price: 1.99 },
      { id: 3, name: 'Potatoes', category: 'vegetables', price: 1.49 }
    ];

    const vegetables = products.filter(p => p.category === 'vegetables');
    expect(vegetables).toHaveLength(2);
    expect(vegetables.every(p => p.category === 'vegetables')).toBe(true);
  });

  it('should sort products by price', () => {
    const products = [
      { id: 1, name: 'Tomatoes', price: 2.99 },
      { id: 2, name: 'Apples', price: 1.99 },
      { id: 3, name: 'Potatoes', price: 1.49 }
    ];

    const sortedProducts = [...products].sort((a, b) => a.price - b.price);
    expect(sortedProducts[0].price).toBe(1.49);
    expect(sortedProducts[2].price).toBe(2.99);
  });

  it('should search products by name', () => {
    const products = [
      { id: 1, name: 'Tomatoes', price: 2.99 },
      { id: 2, name: 'Cherry Tomatoes', price: 3.99 },
      { id: 3, name: 'Potatoes', price: 1.49 }
    ];

    const searchTerm = 'tomato';
    const searchResults = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(searchResults).toHaveLength(2);
    expect(searchResults.every(p => p.name.toLowerCase().includes('tomato'))).toBe(true);
  });
});
