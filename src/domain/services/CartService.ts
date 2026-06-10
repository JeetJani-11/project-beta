/**
 * Cart service for managing shopping cart operations
 */

import { Cart, CartItem, Product } from '../../shared/types';
import { ValidationError } from '../../shared/errors';

export class CartService {
  /**
   * Validate cart items before checkout
   * Check that all items exist, have correct prices, and stock is available
   */
  static validateCartItems(
    items: CartItem[],
    productMap: Map<string, Product>
  ): void {
    if (!items || items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new ValidationError(`Product ${item.productId} not found`);
      }

      if (item.quantity <= 0) {
        throw new ValidationError(`Invalid quantity for product ${product.name}`, {
          productId: item.productId,
          quantity: item.quantity,
        });
      }

      if (item.quantity > product.stock) {
        throw new ValidationError(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      // Verify price hasn't changed drastically (allow 5% variance)
      const priceVariance = Math.abs(product.price - item.price) / product.price;
      if (priceVariance > 0.05) {
        throw new ValidationError(`Price mismatch for ${product.name}`, {
          productId: item.productId,
          savedPrice: item.price,
          currentPrice: product.price,
        });
      }
    }
  }

  /**
   * Calculate cart subtotal
   */
  static calculateSubtotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  /**
   * Create a new cart
   */
  static createCart(userId?: string): Cart {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Cart valid for 24 hours

    return {
      id: this.generateCartId(),
      userId,
      items: [],
      createdAt: now,
      expiresAt,
    };
  }

  /**
   * Generate unique cart ID
   */
  private static generateCartId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add item to cart
   */
  static addItemToCart(
    cart: Cart,
    product: Product,
    quantity: number
  ): Cart {
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    if (quantity > product.stock) {
      throw new ValidationError(
        `Cannot add ${quantity} items. Only ${product.stock} in stock`
      );
    }

    // Check if item already in cart
    const existingItem = cart.items.find((item) => item.productId === product.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new ValidationError(
          `Total quantity exceeds stock. Current: ${existingItem.quantity}, Adding: ${quantity}, Available: ${product.stock}`
        );
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        productId: product.id,
        quantity,
        price: product.price,
      });
    }

    return cart;
  }

  /**
   * Remove item from cart
   */
  static removeItemFromCart(cart: Cart, productId: string): Cart {
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      throw new ValidationError(`Product not found in cart`);
    }

    cart.items.splice(itemIndex, 1);
    return cart;
  }

  /**
   * Update item quantity in cart
   */
  static updateItemQuantity(
    cart: Cart,
    productId: string,
    quantity: number,
    product: Product
  ): Cart {
    if (quantity <= 0) {
      return this.removeItemFromCart(cart, productId);
    }

    if (quantity > product.stock) {
      throw new ValidationError(
        `Cannot set quantity to ${quantity}. Only ${product.stock} in stock`
      );
    }

    const item = cart.items.find((item) => item.productId === productId);
    if (!item) {
      throw new ValidationError(`Product not found in cart`);
    }

    item.quantity = quantity;
    return cart;
  }
}
