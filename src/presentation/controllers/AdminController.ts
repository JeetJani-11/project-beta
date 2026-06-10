/**
 * Admin controller - handles admin operations
 */

import { Request, Response } from 'express';
import { repository } from '../../infrastructure/repositories/InMemoryRepository';
import { DiscountService } from '../../domain/services/DiscountService';
import { ValidationError } from '../../shared/errors';
import { APIResponse } from '../../shared/types';

export class AdminController {
  /**
   * Get admin statistics
   */
  static async getStats(req: Request, res: Response): Promise<Response> {
    const stats = repository.getStats();

    const response: APIResponse = {
      success: true,
      data: stats,
    };

    return res.json(response);
  }

  /**
   * Generate a new discount coupon
   */
  static async generateCoupon(req: Request, res: Response): Promise<Response> {
    const { discountPercent, expiryDays } = req.body;

    // Use provided discount percent or default to 10%
    let coupon = DiscountService.generateCouponCode();

    if (discountPercent) {
      if (discountPercent < 0 || discountPercent > 100) {
        throw new ValidationError('Discount percent must be between 0 and 100');
      }
      coupon.discountPercent = discountPercent;
    }

    if (expiryDays) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
      coupon.expiresAt = expiryDate;
    }

    repository.saveDiscountCode(coupon);

    const response: APIResponse = {
      success: true,
      data: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        expiresAt: coupon.expiresAt,
        isUsed: coupon.isUsed,
      },
    };

    return res.status(201).json(response);
  }

  /**
   * Get all coupons
   */
  static async getAllCoupons(req: Request, res: Response): Promise<Response> {
    const coupons = repository.getAllDiscountCodes();

    const response: APIResponse = {
      success: true,
      data: coupons,
    };

    return res.json(response);
  }

  /**
   * Get active coupons
   */
  static async getActiveCoupons(req: Request, res: Response): Promise<Response> {
    const coupons = repository.getActiveDiscountCodes();

    const response: APIResponse = {
      success: true,
      data: coupons,
    };

    return res.json(response);
  }
}
