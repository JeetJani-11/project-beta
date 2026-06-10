/**
 * Discount service containing core business logic for coupon generation and validation
 * This is the heart of the discount system
 */

import { ulid } from 'ulid';
import { DiscountCode } from '../../shared/types';
import { ValidationError } from '../../shared/errors';

const COUPON_DISCOUNT_PERCENT = 10; // 10% discount for every nth order
const NTH_ORDER = 10; // Generate coupon every 10th order
const COUPON_EXPIRY_DAYS = 30; // Coupons valid for 30 days

export class DiscountService {
  /**
   * Generate a new discount coupon code
   * Returns a ULID-based code
   */
  static generateCouponCode(): DiscountCode {
    const code = ulid().toUpperCase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + COUPON_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    return {
      code,
      discountPercent: COUPON_DISCOUNT_PERCENT,
      isUsed: false,
      createdAt: now,
      expiresAt,
      usageCount: 0,
      maxUses: 1, // Single-use coupon
    };
  }

  /**
   * Check if a coupon should be generated for this order
   * Returns true if this is the nth order
   */
  static shouldGenerateCoupon(totalOrders: number): boolean {
    // Check if the next order number is divisible by NTH_ORDER
    // If totalOrders is 9, next order is 10, so we should generate coupon
    return (totalOrders + 1) % NTH_ORDER === 0;
  }

  /**
   * Validate a coupon code
   * Returns true if valid and unused
   */
  static validateCoupon(coupon: DiscountCode | undefined): boolean {
    if (!coupon) {
      return false;
    }

    // Check if already used
    if (coupon.isUsed) {
      return false;
    }

    // Check if expired
    const now = new Date();
    if (now > coupon.expiresAt) {
      return false;
    }

    // Check if max uses reached
    if (coupon.maxUses && coupon.usageCount && coupon.usageCount >= coupon.maxUses) {
      return false;
    }

    return true;
  }

  /**
   * Calculate discount amount based on coupon
   */
  static calculateDiscount(subtotal: number, discountPercent: number): number {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new ValidationError('Invalid discount percent', { discountPercent });
    }

    const discount = (subtotal * discountPercent) / 100;
    return Math.round(discount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate order total with discount
   */
  static calculateTotal(
    subtotal: number,
    discountPercent: number = 0,
    taxPercent: number = 0
  ): number {
    if (subtotal < 0) {
      throw new ValidationError('Subtotal cannot be negative');
    }

    const discount = this.calculateDiscount(subtotal, discountPercent);
    const afterDiscount = subtotal - discount;
    const tax = (afterDiscount * taxPercent) / 100;
    const total = afterDiscount + tax;

    return Math.round(total * 100) / 100;
  }

  /**
   * Mark coupon as used
   */
  static markCouponAsUsed(coupon: DiscountCode, userId: string): DiscountCode {
    return {
      ...coupon,
      isUsed: true,
      usedBy: userId,
      usedAt: new Date(),
      usageCount: (coupon.usageCount || 0) + 1,
    };
  }
}
