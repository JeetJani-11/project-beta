/**
 * Order service for managing order operations
 */

import { Order, OrderStatus, CartItem } from '../../shared/types';
import { ValidationError } from '../../shared/errors';

export class OrderService {
  /**
   * Create a new order from cart items
   */
  static createOrder(
    userId: string,
    items: CartItem[],
    subtotal: number,
    discountPercent: number = 0,
    discountCode?: string
  ): Order {
    if (!items || items.length === 0) {
      throw new ValidationError('Cannot create order with empty cart');
    }

    if (subtotal < 0) {
      throw new ValidationError('Invalid subtotal');
    }

    if (discountPercent < 0 || discountPercent > 100) {
      throw new ValidationError('Invalid discount percent', { discountPercent });
    }

    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal - discount;

    return {
      id: this.generateOrderId(),
      userId,
      items: [...items],
      subtotal,
      discount: Math.round(discount * 100) / 100,
      discountCode,
      total: Math.round(total * 100) / 100,
      status: OrderStatus.COMPLETED,
      createdAt: new Date(),
    };
  }

  /**
   * Generate unique order ID
   */
  private static generateOrderId(): string {
    return `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Validate order before completion
   */
  static validateOrder(order: Order): void {
    if (!order.userId) {
      throw new ValidationError('User ID is required');
    }

    if (!order.items || order.items.length === 0) {
      throw new ValidationError('Order must have at least one item');
    }

    if (order.total < 0) {
      throw new ValidationError('Order total cannot be negative');
    }

    if (order.discount < 0 || order.discount > order.subtotal) {
      throw new ValidationError('Invalid discount amount', {
        discount: order.discount,
        subtotal: order.subtotal,
      });
    }
  }

  /**
   * Calculate order statistics
   */
  static calculateStats(orders: Order[]): {
    totalOrders: number;
    totalRevenue: number;
    totalItemsSold: number;
  } {
    let totalRevenue = 0;
    let totalItemsSold = 0;

    for (const order of orders) {
      totalRevenue += order.total;
      totalItemsSold += order.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    return {
      totalOrders: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalItemsSold,
    };
  }
}
