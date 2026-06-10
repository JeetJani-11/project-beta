/**
 * API routes configuration
 * All routes are prefixed with /api/v1
 */

import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { CartController } from '../controllers/CartController';
import { CheckoutController } from '../controllers/CheckoutController';
import { ProductsController } from '../controllers/ProductsController';
import { AdminController } from '../controllers/AdminController';

export const createRoutes = (): Router => {
  const router = Router();

  // Products endpoints
  router.get('/products', asyncHandler(ProductsController.getAll));
  router.get('/products/:id', asyncHandler(ProductsController.getById));

  // Cart endpoints
  router.post('/carts', asyncHandler(CartController.createCart));
  router.get('/carts/:cartId', asyncHandler(CartController.getCart));
  router.post('/carts/:cartId/items', asyncHandler(CartController.addItemToCart));
  router.delete('/carts/:cartId/items/:itemId', asyncHandler(CartController.removeItemFromCart));
  router.put('/carts/:cartId/items/:itemId', asyncHandler(CartController.updateItemQuantity));

  // Checkout endpoint
  router.post('/checkout', asyncHandler(CheckoutController.checkout));

  // Admin endpoints
  router.get('/admin/stats', asyncHandler(AdminController.getStats));
  router.post('/admin/coupons', asyncHandler(AdminController.generateCoupon));
  router.get('/admin/coupons', asyncHandler(AdminController.getAllCoupons));
  router.get('/admin/coupons/active', asyncHandler(AdminController.getActiveCoupons));

  return router;
};
