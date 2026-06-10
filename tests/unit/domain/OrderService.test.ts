/**
 * Unit tests for OrderService
 */

import { OrderService } from '../../../src/domain/services/OrderService';
import { CartItem, OrderStatus } from '../../../src/shared/types';

describe('OrderService', () => {
  const mockItems: CartItem[] = [
    { productId: 'prod_1', quantity: 2, price: 1000 },
    { productId: 'prod_2', quantity: 1, price: 50 },
  ];

  describe('createOrder', () => {
    it('should create order with correct properties', () => {
      const order = OrderService.createOrder('user_123', mockItems, 2050);

      expect(order.id).toBeDefined();
      expect(order.userId).toBe('user_123');
      expect(order.items).toHaveLength(2);
      expect(order.subtotal).toBe(2050);
      expect(order.discount).toBe(0);
      expect(order.total).toBe(2050);
      expect(order.status).toBe(OrderStatus.COMPLETED);
    });

    it('should apply discount to order', () => {
      const order = OrderService.createOrder('user_123', mockItems, 2050, 10);

      expect(order.discount).toBe(205);
      expect(order.total).toBe(1845);
    });

    it('should include discount code', () => {
      const order = OrderService.createOrder(
        'user_123',
        mockItems,
        2050,
        10,
        'CODE_ABC123'
      );

      expect(order.discountCode).toBe('CODE_ABC123');
    });

    it('should throw error for empty items', () => {
      expect(() => OrderService.createOrder('user_123', [], 0)).toThrow();
    });

    it('should throw error for negative subtotal', () => {
      expect(() => OrderService.createOrder('user_123', mockItems, -100)).toThrow();
    });

    it('should throw error for invalid discount', () => {
      expect(() => OrderService.createOrder('user_123', mockItems, 2050, 150)).toThrow();
    });
  });

  describe('validateOrder', () => {
    it('should validate correct order', () => {
      const order = OrderService.createOrder('user_123', mockItems, 2050);

      expect(() => OrderService.validateOrder(order)).not.toThrow();
    });

    it('should throw error for missing userId', () => {
      const order = OrderService.createOrder('', mockItems, 2050);
      order.userId = '';

      expect(() => OrderService.validateOrder(order)).toThrow();
    });

    it('should throw error for negative discount', () => {
      const order = OrderService.createOrder('user_123', mockItems, 2050);
      order.discount = -100;

      expect(() => OrderService.validateOrder(order)).toThrow();
    });
  });

  describe('calculateStats', () => {
    it('should calculate stats for empty orders', () => {
      const stats = OrderService.calculateStats([]);

      expect(stats.totalOrders).toBe(0);
      expect(stats.totalRevenue).toBe(0);
      expect(stats.totalItemsSold).toBe(0);
    });

    it('should calculate stats for single order', () => {
      const order = OrderService.createOrder('user_123', mockItems, 2050, 10);
      const stats = OrderService.calculateStats([order]);

      expect(stats.totalOrders).toBe(1);
      expect(stats.totalRevenue).toBe(1845);
      expect(stats.totalItemsSold).toBe(3); // 2 + 1
    });

    it('should calculate stats for multiple orders', () => {
      const order1 = OrderService.createOrder('user_1', mockItems, 2050);
      const order2 = OrderService.createOrder('user_2', mockItems, 2050, 10);
      const stats = OrderService.calculateStats([order1, order2]);

      expect(stats.totalOrders).toBe(2);
      expect(stats.totalRevenue).toBe(3895); // 2050 + 1845
      expect(stats.totalItemsSold).toBe(6); // 3 + 3
    });
  });
});
