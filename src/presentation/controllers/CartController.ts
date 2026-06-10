/**
 * Cart controller - handles cart operations
 */

import { Request, Response } from 'express';
import { repository } from '../../infrastructure/repositories/InMemoryRepository';
import { CartService } from '../../domain/services/CartService';
import { ValidationError, NotFoundError } from '../../shared/errors';
import { APIResponse } from '../../shared/types';

export class CartController {
  /**
   * Create a new cart
   */
  static async createCart(req: Request, res: Response): Promise<Response> {
    const { userId } = req.body;

    const cart = CartService.createCart(userId);
    repository.saveCart(cart);

    const response: APIResponse = {
      success: true,
      data: cart,
    };

    return res.status(201).json(response);
  }

  /**
   * Get cart by ID
   */
  static async getCart(req: Request, res: Response): Promise<Response> {
    const { cartId } = req.params;

    const cart = repository.getCart(cartId);
    if (!cart) {
      throw new NotFoundError('Cart', cartId);
    }

    const response: APIResponse = {
      success: true,
      data: cart,
    };

    return res.json(response);
  }

  /**
   * Add item to cart
   */
  static async addItemToCart(req: Request, res: Response): Promise<Response> {
    const { cartId } = req.params;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      throw new ValidationError('productId and quantity are required');
    }

    const cart = repository.getCart(cartId);
    if (!cart) {
      throw new NotFoundError('Cart', cartId);
    }

    const product = repository.getProduct(productId);
    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    CartService.addItemToCart(cart, product, quantity);
    repository.saveCart(cart);

    const response: APIResponse = {
      success: true,
      data: cart,
    };

    return res.json(response);
  }

  /**
   * Remove item from cart
   */
  static async removeItemFromCart(req: Request, res: Response): Promise<Response> {
    const { cartId, itemId } = req.params;

    const cart = repository.getCart(cartId);
    if (!cart) {
      throw new NotFoundError('Cart', cartId);
    }

    CartService.removeItemFromCart(cart, itemId);
    repository.saveCart(cart);

    const response: APIResponse = {
      success: true,
      data: cart,
    };

    return res.json(response);
  }

  /**
   * Update item quantity in cart
   */
  static async updateItemQuantity(req: Request, res: Response): Promise<Response> {
    const { cartId, itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      throw new ValidationError('quantity is required');
    }

    const cart = repository.getCart(cartId);
    if (!cart) {
      throw new NotFoundError('Cart', cartId);
    }

    const product = repository.getProduct(itemId);
    if (!product) {
      throw new NotFoundError('Product', itemId);
    }

    CartService.updateItemQuantity(cart, itemId, quantity, product);
    repository.saveCart(cart);

    const response: APIResponse = {
      success: true,
      data: cart,
    };

    return res.json(response);
  }
}
