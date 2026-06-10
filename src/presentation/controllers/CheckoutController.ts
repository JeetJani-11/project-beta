/**
 * Checkout controller - handles order placement
 */

import { Request, Response } from 'express';
import { repository } from '../../infrastructure/repositories/InMemoryRepository';
import { CartService } from '../../domain/services/CartService';
import { OrderService } from '../../domain/services/OrderService';
import { DiscountService } from '../../domain/services/DiscountService';
import { ValidationError, NotFoundError } from '../../shared/errors';
import { APIResponse } from '../../shared/types';

export class CheckoutController {
  /**
   * Place an order
   */
  static async checkout(req: Request, res: Response): Promise<Response> {
    const { cartId, userId, couponCode } = req.body;

    if (!cartId || !userId) {
      throw new ValidationError('cartId and userId are required');
    }

    // Get cart
    const cart = repository.getCart(cartId);
    if (!cart) {
      throw new NotFoundError('Cart', cartId);
    }

    // Validate cart items
    const productMap = new Map(
      repository.getAllProducts().map((p) => [p.id, p])
    );
    CartService.validateCartItems(cart.items, productMap);

    // Calculate subtotal
    const subtotal = CartService.calculateSubtotal(cart.items);

    // Apply coupon if provided
    let discountPercent = 0;
    if (couponCode) {
      const coupon = repository.getDiscountCode(couponCode);

      if (!DiscountService.validateCoupon(coupon)) {
        throw new ValidationError('Invalid or expired coupon code');
      }

      if (coupon) {
        discountPercent = coupon.discountPercent;
      }
    }

    // Create order
    const order = OrderService.createOrder(
      userId,
      cart.items,
      subtotal,
      discountPercent,
      couponCode
    );

    // Validate order
    OrderService.validateOrder(order);

    // Save order
    repository.saveOrder(order);

    // Update coupon if used
    if (couponCode) {
      const coupon = repository.getDiscountCode(couponCode);
      if (coupon) {
        const updatedCoupon = DiscountService.markCouponAsUsed(coupon, userId);
        repository.updateDiscountCode(updatedCoupon);
      }
    }

    // Update product stock
    for (const item of cart.items) {
      repository.updateProductStock(item.productId, item.quantity);
    }

    // Generate coupon for nth order if applicable
    const totalOrders = repository.getOrderCount();
    if (DiscountService.shouldGenerateCoupon(totalOrders)) {
      const newCoupon = DiscountService.generateCouponCode();
      repository.saveDiscountCode(newCoupon);

      // Include new coupon in response
      const response: APIResponse = {
        success: true,
        data: {
          order,
          message: 'Congratulations! You earned a discount coupon!',
          earnedCoupon: newCoupon.code,
          earnedDiscount: `${newCoupon.discountPercent}%`,
        },
      };

      // Clear cart after successful checkout
      repository.deleteCart(cartId);

      return res.status(201).json(response);
    }

    // Clear cart after successful checkout
    repository.deleteCart(cartId);

    const response: APIResponse = {
      success: true,
      data: { order },
    };

    return res.status(201).json(response);
  }
}
