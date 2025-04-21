import { describe, it, expect, beforeEach } from 'vitest';

describe('Shopping Cart', () => {
  let cart;

  beforeEach(() => {
    // Reset cart before each test
    cart = {
      items: [],
      total: 0,
      
      addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          this.items.push({ ...product, quantity: 1 });
        }
        this.updateTotal();
      },

      removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.updateTotal();
      },

      updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
          item.quantity = Math.max(0, quantity);
          if (item.quantity === 0) {
            this.removeItem(productId);
          }
        }
        this.updateTotal();
      },

      updateTotal() {
        this.total = this.items.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0);
      }
    };
  });

  it('should add items to cart', () => {
    const product = { id: 1, name: 'Tomatoes', price: 2.99 };
    cart.addItem(product);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toEqual({ ...product, quantity: 1 });
  });

  it('should update quantity for existing items', () => {
    const product = { id: 1, name: 'Tomatoes', price: 2.99 };
    cart.addItem(product);
    cart.addItem(product);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
  });

  it('should remove items from cart', () => {
    const product = { id: 1, name: 'Tomatoes', price: 2.99 };
    cart.addItem(product);
    cart.removeItem(1);
    expect(cart.items).toHaveLength(0);
  });

  it('should calculate total correctly', () => {
    const product1 = { id: 1, name: 'Tomatoes', price: 2.99 };
    const product2 = { id: 2, name: 'Potatoes', price: 1.99 };
    cart.addItem(product1);
    cart.addItem(product1); // 2 tomatoes
    cart.addItem(product2); // 1 potato
    expect(cart.total).toBeCloseTo(7.97); // 2.99 * 2 + 1.99
  });

  it('should handle quantity updates', () => {
    const product = { id: 1, name: 'Tomatoes', price: 2.99 };
    cart.addItem(product);
    cart.updateQuantity(1, 3);
    expect(cart.items[0].quantity).toBe(3);
    expect(cart.total).toBeCloseTo(8.97); // 2.99 * 3
  });

  it('should remove item when quantity is set to 0', () => {
    const product = { id: 1, name: 'Tomatoes', price: 2.99 };
    cart.addItem(product);
    cart.updateQuantity(1, 0);
    expect(cart.items).toHaveLength(0);
  });
});
