/**
 * Unit tests for DiscountService
 */

import { DiscountService } from '../../../src/domain/services/DiscountService';
import { DiscountCode } from '../../../src/shared/types';

describe('DiscountService', () => {
  describe('generateCouponCode', () => {
    it('should generate a valid coupon code', () => {
      const coupon = DiscountService.generateCouponCode();

      expect(coupon).toHaveProperty('code');
      expect(coupon.code).toMatch(/^[0-9A-Z]+$/);
      expect(coupon.code).toHaveLength(26); // ULID length
      expect(coupon.discountPercent).toBe(10);
      expect(coupon.isUsed).toBe(false);
    });

    it('should set correct expiry date', () => {
      const coupon = DiscountService.generateCouponCode();
      const expectedDays = 30;
      const expectedExpiry = new Date(coupon.createdAt.getTime() + expectedDays * 24 * 60 * 60 * 1000);

      const daysDifference = Math.abs(
        (coupon.expiresAt.getTime() - expectedExpiry.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDifference).toBeLessThan(1); // Allow 1 day variance
    });

    it('should generate unique codes', () => {
      const coupon1 = DiscountService.generateCouponCode();
      const coupon2 = DiscountService.generateCouponCode();

      expect(coupon1.code).not.toBe(coupon2.code);
    });
  });

  describe('shouldGenerateCoupon', () => {
    it('should return true for every 10th order', () => {
      expect(DiscountService.shouldGenerateCoupon(9)).toBe(true); // Next order is 10
      expect(DiscountService.shouldGenerateCoupon(19)).toBe(true); // Next order is 20
      expect(DiscountService.shouldGenerateCoupon(29)).toBe(true); // Next order is 30
    });

    it('should return false for non-10th orders', () => {
      expect(DiscountService.shouldGenerateCoupon(0)).toBe(false);
      expect(DiscountService.shouldGenerateCoupon(5)).toBe(false);
      expect(DiscountService.shouldGenerateCoupon(11)).toBe(false);
      expect(DiscountService.shouldGenerateCoupon(25)).toBe(false);
    });
  });

  describe('validateCoupon', () => {
    let validCoupon: DiscountCode;

    beforeEach(() => {
      validCoupon = DiscountService.generateCouponCode();
    });

    it('should validate a valid unused coupon', () => {
      const isValid = DiscountService.validateCoupon(validCoupon);
      expect(isValid).toBe(true);
    });

    it('should reject undefined coupon', () => {
      const isValid = DiscountService.validateCoupon(undefined);
      expect(isValid).toBe(false);
    });

    it('should reject used coupon', () => {
      validCoupon.isUsed = true;
      const isValid = DiscountService.validateCoupon(validCoupon);
      expect(isValid).toBe(false);
    });

    it('should reject expired coupon', () => {
      validCoupon.expiresAt = new Date(Date.now() - 1000); // 1 second ago
      const isValid = DiscountService.validateCoupon(validCoupon);
      expect(isValid).toBe(false);
    });

    it('should reject coupon at max uses', () => {
      validCoupon.maxUses = 1;
      validCoupon.usageCount = 1;
      const isValid = DiscountService.validateCoupon(validCoupon);
      expect(isValid).toBe(false);
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate 10% discount correctly', () => {
      const discount = DiscountService.calculateDiscount(100, 10);
      expect(discount).toBe(10);
    });

    it('should calculate 0% discount', () => {
      const discount = DiscountService.calculateDiscount(100, 0);
      expect(discount).toBe(0);
    });

    it('should handle decimal amounts', () => {
      const discount = DiscountService.calculateDiscount(99.99, 10);
      expect(discount).toBe(10);
    });

    it('should throw error for invalid discount percent', () => {
      expect(() => DiscountService.calculateDiscount(100, -5)).toThrow();
      expect(() => DiscountService.calculateDiscount(100, 105)).toThrow();
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total without discount', () => {
      const total = DiscountService.calculateTotal(100);
      expect(total).toBe(100);
    });

    it('should calculate total with discount', () => {
      const total = DiscountService.calculateTotal(100, 10);
      expect(total).toBe(90);
    });

    it('should calculate total with discount and tax', () => {
      const total = DiscountService.calculateTotal(100, 10, 10);
      // Subtotal: 100, After discount: 90, Tax: 9, Total: 99
      expect(total).toBe(99);
    });

    it('should throw error for negative subtotal', () => {
      expect(() => DiscountService.calculateTotal(-100)).toThrow();
    });
  });

  describe('markCouponAsUsed', () => {
    it('should mark coupon as used', () => {
      const coupon = DiscountService.generateCouponCode();
      const usedCoupon = DiscountService.markCouponAsUsed(coupon, 'user123');

      expect(usedCoupon.isUsed).toBe(true);
      expect(usedCoupon.usedBy).toBe('user123');
      expect(usedCoupon.usedAt).toBeInstanceOf(Date);
      expect(usedCoupon.usageCount).toBe(1);
    });

    it('should preserve coupon code', () => {
      const coupon = DiscountService.generateCouponCode();
      const usedCoupon = DiscountService.markCouponAsUsed(coupon, 'user123');

      expect(usedCoupon.code).toBe(coupon.code);
    });
  });
});
