/**
 * API routes configuration
 * All routes are prefixed with /api/v1
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { CartController } from '../controllers/CartController';
import { CheckoutController } from '../controllers/CheckoutController';
import { ProductsController } from '../controllers/ProductsController';
import { AdminController } from '../controllers/AdminController';
import { AuthController } from '../controllers/AuthController';
import AuthMiddleware from '../middleware/authMiddleware';

export const createRoutes = (): Router => {
  const router = Router();

  // Initialize middleware and controllers
  const authMiddleware = new AuthMiddleware();
  const authController = new AuthController();

  // Auth endpoints (public)
  router.post('/auth/register', asyncHandler(authController.register));
  router.post('/auth/login', asyncHandler(authController.login));

  // Auth endpoints (protected)
  router.get('/auth/me', asyncHandler(authMiddleware.verifyToken), asyncHandler(authController.getCurrentUser));
  router.get('/auth/verify', asyncHandler(authMiddleware.verifyToken), asyncHandler(authController.verifyToken));

  // Products endpoints (public)
  router.get('/products', asyncHandler(ProductsController.getAll));
  router.get('/products/:id', asyncHandler(ProductsController.getById));

  // Cart endpoints (protected)
  router.post('/carts', asyncHandler(authMiddleware.verifyToken), asyncHandler(CartController.createCart));
  router.get('/carts/:cartId', asyncHandler(authMiddleware.verifyToken), asyncHandler(CartController.getCart));
  router.post('/carts/:cartId/items', asyncHandler(authMiddleware.verifyToken), asyncHandler(CartController.addItemToCart));
  router.delete('/carts/:cartId/items/:itemId', asyncHandler(authMiddleware.verifyToken), asyncHandler(CartController.removeItemFromCart));
  router.put('/carts/:cartId/items/:itemId', asyncHandler(authMiddleware.verifyToken), asyncHandler(CartController.updateItemQuantity));

  // Checkout endpoint (protected)
  router.post('/checkout', asyncHandler(authMiddleware.verifyToken), asyncHandler(CheckoutController.checkout));

  // Admin endpoints (protected - require admin role)
  router.get('/admin/stats', asyncHandler(authMiddleware.verifyToken), asyncHandler(authMiddleware.requireAdmin), asyncHandler(AdminController.getStats));
  router.post('/admin/coupons', asyncHandler(authMiddleware.verifyToken), asyncHandler(authMiddleware.requireAdmin), asyncHandler(AdminController.generateCoupon));
  router.get('/admin/coupons', asyncHandler(authMiddleware.verifyToken), asyncHandler(authMiddleware.requireAdmin), asyncHandler(AdminController.getAllCoupons));
  router.get('/admin/coupons/active', asyncHandler(authMiddleware.verifyToken), asyncHandler(authMiddleware.requireAdmin), asyncHandler(AdminController.getActiveCoupons));

  return router;
};
