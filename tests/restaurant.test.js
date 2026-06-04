import { describe, it, expect } from 'vitest';
import restaurant from '../_data/restaurant.md';

describe('restaurant data', () => {
  it('has all required fields', () => {
    expect(restaurant.name).toBeDefined();
    expect(restaurant.phone).toBeDefined();
    expect(restaurant.address).toBeDefined();
  });

  it('has a valid map coordinate string', () => {
    const parts = restaurant.map.split(',').map(c => parseFloat(c.trim()));
    expect(parts.length).toBe(2);
    expect(isNaN(parts[0])).toBe(false);
    expect(isNaN(parts[1])).toBe(false);
  });

  it('has menu categories with items', () => {
    expect(restaurant.menu).toBeDefined();
    expect(Array.isArray(restaurant.menu)).toBe(true);
    expect(restaurant.menu.length).toBeGreaterThan(0);
    
    restaurant.menu.forEach(category => {
      expect(category.name).toBeDefined();
      expect(category.items).toBeDefined();
      expect(Array.isArray(category.items)).toBe(true);
      expect(category.items.length).toBeGreaterThan(0);
      
      category.items.forEach(item => {
        expect(item.name).toBeDefined();
        expect(item.price).toBeDefined();
      });
    });
  });
});
