/**
 * Unit tests for CartService
 */

import { CartService } from '../../../src/domain/services/CartService';
import { Cart, CartItem, Product } from '../../../src/shared/types';

describe('CartService', () => {
  let mockProduct: Product;
  let productMap: Map<string, Product>;

  beforeEach(() => {
    mockProduct = {
      id: 'prod_1',
      name: 'Laptop',
      price: 1000,
      stock: 10,
      createdAt: new Date(),
    };

    productMap = new Map([['prod_1', mockProduct]]);
  });

  describe('createCart', () => {
    it('should create cart with correct properties', () => {
      const cart = CartService.createCart();

      expect(cart.id).toBeDefined();
      expect(cart.items).toEqual([]);
      expect(cart.createdAt).toBeInstanceOf(Date);
      expect(cart.expiresAt).toBeInstanceOf(Date);
    });

    it('should set userId if provided', () => {
      const cart = CartService.createCart('user_123');

      expect(cart.userId).toBe('user_123');
    });

    it('should have expiry 24 hours from now', () => {
      const cart = CartService.createCart();
      const diff = cart.expiresAt.getTime() - cart.createdAt.getTime();
      const hours = diff / (1000 * 60 * 60);

      expect(hours).toBeCloseTo(24, 1);
    });
  });

  describe('calculateSubtotal', () => {
    it('should calculate empty cart subtotal', () => {
      const subtotal = CartService.calculateSubtotal([]);
      expect(subtotal).toBe(0);
    });

    it('should calculate single item subtotal', () => {
      const items: CartItem[] = [{ productId: 'prod_1', quantity: 2, price: 1000 }];
      const subtotal = CartService.calculateSubtotal(items);

      expect(subtotal).toBe(2000);
    });

    it('should calculate multiple items subtotal', () => {
      const items: CartItem[] = [
        { productId: 'prod_1', quantity: 2, price: 1000 },
        { productId: 'prod_2', quantity: 3, price: 50 },
      ];
      const subtotal = CartService.calculateSubtotal(items);

      expect(subtotal).toBe(2150);
    });
  });

  describe('addItemToCart', () => {
    it('should add item to empty cart', () => {
      const cart = CartService.createCart();
      const updatedCart = CartService.addItemToCart(cart, mockProduct, 2);

      expect(updatedCart.items).toHaveLength(1);
      expect(updatedCart.items[0].productId).toBe('prod_1');
      expect(updatedCart.items[0].quantity).toBe(2);
    });

    it('should throw error for zero quantity', () => {
      const cart = CartService.createCart();

      expect(() => CartService.addItemToCart(cart, mockProduct, 0)).toThrow();
    });

    it('should throw error if quantity exceeds stock', () => {
      const cart = CartService.createCart();

      expect(() => CartService.addItemToCart(cart, mockProduct, 15)).toThrow();
    });

    it('should increase quantity if item already in cart', () => {
      const cart = CartService.createCart();
      CartService.addItemToCart(cart, mockProduct, 2);
      CartService.addItemToCart(cart, mockProduct, 3);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
    });
  });

  describe('removeItemFromCart', () => {
    it('should remove item from cart', () => {
      const cart = CartService.createCart();
      CartService.addItemToCart(cart, mockProduct, 2);
      CartService.removeItemFromCart(cart, 'prod_1');

      expect(cart.items).toHaveLength(0);
    });

    it('should throw error if product not in cart', () => {
      const cart = CartService.createCart();

      expect(() => CartService.removeItemFromCart(cart, 'prod_999')).toThrow();
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', () => {
      const cart = CartService.createCart();
      CartService.addItemToCart(cart, mockProduct, 2);
      CartService.updateItemQuantity(cart, 'prod_1', 5, mockProduct);

      expect(cart.items[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0', () => {
      const cart = CartService.createCart();
      CartService.addItemToCart(cart, mockProduct, 2);
      CartService.updateItemQuantity(cart, 'prod_1', 0, mockProduct);

      expect(cart.items).toHaveLength(0);
    });

    it('should throw error if quantity exceeds stock', () => {
      const cart = CartService.createCart();
      CartService.addItemToCart(cart, mockProduct, 2);

      expect(() => CartService.updateItemQuantity(cart, 'prod_1', 15, mockProduct)).toThrow();
    });
  });

  describe('validateCartItems', () => {
    it('should throw error for empty cart', () => {
      expect(() => CartService.validateCartItems([], productMap)).toThrow();
    });

    it('should throw error for nonexistent product', () => {
      const items: CartItem[] = [
        { productId: 'prod_999', quantity: 1, price: 100 },
      ];

      expect(() => CartService.validateCartItems(items, productMap)).toThrow();
    });

    it('should throw error for insufficient stock', () => {
      const items: CartItem[] = [
        { productId: 'prod_1', quantity: 15, price: 1000 },
      ];

      expect(() => CartService.validateCartItems(items, productMap)).toThrow();
    });

    it('should validate correct cart items', () => {
      const items: CartItem[] = [{ productId: 'prod_1', quantity: 5, price: 1000 }];

      expect(() => CartService.validateCartItems(items, productMap)).not.toThrow();
    });
  });
});
