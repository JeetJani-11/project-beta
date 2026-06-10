/**
 * Supabase PostgreSQL repository implementation
 * Implements the same interface as InMemoryRepository for seamless swapping
 */

import { getSupabaseClient } from '../../config/supabase';
import { User, Product, Cart, Order, DiscountCode } from '../../shared/types';
import { NotFoundError, InternalServerError } from '../../shared/errors';
import { logger } from '../../config/logger';

interface SupabaseProduct {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  description?: string;
  created_at: string;
}

interface SupabaseOrder {
  id: string;
  user_id: string;
  subtotal: string | number;
  discount: string | number;
  discount_code?: string;
  total: string | number;
  status: string;
  created_at: string;
  order_items?: SupabaseOrderItem[];
}

interface SupabaseOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: string | number;
  created_at: string;
}

interface SupabaseDiscountCode {
  code: string;
  discount_percent: string | number;
  is_used: boolean;
  max_uses?: number;
  usage_count: number;
  used_by?: string;
  used_at?: string;
  created_at: string;
  expires_at: string;
}

interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  created_at: string;
}

export class SupabaseRepository {
  private supabase = getSupabaseClient();
  private static instance: SupabaseRepository;

  private constructor() {
    logger.info('SupabaseRepository initialized');
  }

  static getInstance(): SupabaseRepository {
    if (!SupabaseRepository.instance) {
      SupabaseRepository.instance = new SupabaseRepository();
    }
    return SupabaseRepository.instance;
  }

  // ===== Products =====
  async saveProduct(product: Product): Promise<void> {
    const { error } = await this.supabase.from('products').upsert({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      created_at: product.createdAt,
    });

    if (error) {
      logger.error('Failed to save product', error);
      throw new InternalServerError('Failed to save product');
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined; // Not found
      }
      logger.error('Failed to get product', error);
      throw new InternalServerError('Failed to get product');
    }

    return this.mapToProduct(data);
  }

  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase.from('products').select('*').order('created_at', { ascending: true });

    if (error) {
      logger.error('Failed to get all products', error);
      throw new InternalServerError('Failed to get all products');
    }

    return data.map(this.mapToProduct);
  }

  async updateProductStock(productId: string, quantity: number): Promise<void> {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    const newStock = Math.max(0, product.stock - quantity);

    const { error } = await this.supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (error) {
      logger.error('Failed to update product stock', error);
      throw new InternalServerError('Failed to update product stock');
    }
  }

  // ===== Carts =====
  async saveCart(cart: Cart): Promise<void> {
    const { error: cartError } = await this.supabase.from('carts').upsert({
      id: cart.id,
      user_id: cart.userId,
      created_at: cart.createdAt,
      expires_at: cart.expiresAt,
    });

    if (cartError) {
      logger.error('Failed to save cart', cartError);
      throw new InternalServerError('Failed to save cart');
    }

    // Delete existing cart items
    await this.supabase.from('cart_items').delete().eq('cart_id', cart.id);

    // Insert cart items
    if (cart.items.length > 0) {
      const cartItems = cart.items.map((item) => ({
        cart_id: cart.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await this.supabase.from('cart_items').insert(cartItems);

      if (itemsError) {
        logger.error('Failed to save cart items', itemsError);
        throw new InternalServerError('Failed to save cart items');
      }
    }
  }

  async getCart(id: string): Promise<Cart | undefined> {
    const { data: cartData, error: cartError } = await this.supabase
      .from('carts')
      .select('*')
      .eq('id', id)
      .single();

    if (cartError) {
      if (cartError.code === 'PGRST116') {
        return undefined;
      }
      logger.error('Failed to get cart', cartError);
      throw new InternalServerError('Failed to get cart');
    }

    const { data: itemsData, error: itemsError } = await this.supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', id);

    if (itemsError) {
      logger.error('Failed to get cart items', itemsError);
      throw new InternalServerError('Failed to get cart items');
    }

    return {
      id: cartData.id,
      userId: cartData.user_id,
      items: itemsData.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
      createdAt: new Date(cartData.created_at),
      expiresAt: new Date(cartData.expires_at),
    };
  }

  async deleteCart(id: string): Promise<void> {
    const { error } = await this.supabase.from('carts').delete().eq('id', id);

    if (error) {
      logger.error('Failed to delete cart', error);
      throw new InternalServerError('Failed to delete cart');
    }
  }

  // ===== Orders =====
  async saveOrder(order: Order): Promise<void> {
    const { error: orderError } = await this.supabase.from('orders').insert({
      id: order.id,
      user_id: order.userId,
      subtotal: order.subtotal,
      discount: order.discount,
      discount_code: order.discountCode,
      total: order.total,
      status: order.status,
      created_at: order.createdAt,
    });

    if (orderError) {
      logger.error('Failed to save order', orderError);
      throw new InternalServerError('Failed to save order');
    }

    // Insert order items
    if (order.items.length > 0) {
      const orderItems = order.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await this.supabase.from('order_items').insert(orderItems);

      if (itemsError) {
        logger.error('Failed to save order items', itemsError);
        throw new InternalServerError('Failed to save order items');
      }
    }
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const { data: orderData, error: orderError } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return undefined;
      }
      logger.error('Failed to get order', orderError);
      throw new InternalServerError('Failed to get order');
    }

    const { data: itemsData, error: itemsError } = await this.supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) {
      logger.error('Failed to get order items', itemsError);
      throw new InternalServerError('Failed to get order items');
    }

    return this.mapToOrder(orderData, itemsData);
  }

  async getAllOrders(): Promise<Order[]> {
    const { data: ordersData, error: ordersError } = await this.supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (ordersError) {
      logger.error('Failed to get all orders', ordersError);
      throw new InternalServerError('Failed to get all orders');
    }

    return ordersData.map((order) => this.mapToOrder(order, order.order_items));
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const { data: ordersData, error: ordersError } = await this.supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      logger.error('Failed to get orders by user', ordersError);
      throw new InternalServerError('Failed to get orders by user');
    }

    return ordersData.map((order) => this.mapToOrder(order, order.order_items));
  }

  async getOrderCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (error) {
      logger.error('Failed to get order count', error);
      throw new InternalServerError('Failed to get order count');
    }

    return count || 0;
  }

  async getOrderCountByUser(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      logger.error('Failed to get order count by user', error);
      throw new InternalServerError('Failed to get order count by user');
    }

    return count || 0;
  }

  async getTotalRevenue(): Promise<number> {
    const { data, error } = await this.supabase.rpc('sum', {
      table_name: 'orders',
      column_name: 'total',
    });

    if (error) {
      // Fallback: fetch all orders and calculate
      const orders = await this.getAllOrders();
      return orders.reduce((sum, order) => sum + order.total, 0);
    }

    return data || 0;
  }

  async getTotalDiscounts(): Promise<number> {
    const { data, error } = await this.supabase.rpc('sum', {
      table_name: 'orders',
      column_name: 'discount',
    });

    if (error) {
      // Fallback: fetch all orders and calculate
      const orders = await this.getAllOrders();
      return orders.reduce((sum, order) => sum + order.discount, 0);
    }

    return data || 0;
  }

  // ===== Discount Codes =====
  async saveDiscountCode(code: DiscountCode): Promise<void> {
    const { error } = await this.supabase.from('discount_codes').insert({
      code: code.code,
      discount_percent: code.discountPercent,
      is_used: code.isUsed,
      max_uses: code.maxUses,
      usage_count: code.usageCount,
      used_by: code.usedBy,
      used_at: code.usedAt,
      created_at: code.createdAt,
      expires_at: code.expiresAt,
    });

    if (error) {
      logger.error('Failed to save discount code', error);
      throw new InternalServerError('Failed to save discount code');
    }
  }

  async getDiscountCode(code: string): Promise<DiscountCode | undefined> {
    const { data, error } = await this.supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      logger.error('Failed to get discount code', error);
      throw new InternalServerError('Failed to get discount code');
    }

    return this.mapToDiscountCode(data);
  }

  async updateDiscountCode(code: DiscountCode): Promise<void> {
    const { error } = await this.supabase
      .from('discount_codes')
      .update({
        is_used: code.isUsed,
        usage_count: code.usageCount,
        used_by: code.usedBy,
        used_at: code.usedAt,
      })
      .eq('code', code.code);

    if (error) {
      logger.error('Failed to update discount code', error);
      throw new InternalServerError('Failed to update discount code');
    }
  }

  async getAllDiscountCodes(): Promise<DiscountCode[]> {
    const { data, error } = await this.supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to get all discount codes', error);
      throw new InternalServerError('Failed to get all discount codes');
    }

    return data.map(this.mapToDiscountCode);
  }

  async getActiveDiscountCodes(): Promise<DiscountCode[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('discount_codes')
      .select('*')
      .eq('is_used', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to get active discount codes', error);
      throw new InternalServerError('Failed to get active discount codes');
    }

    return data.map(this.mapToDiscountCode);
  }

  // ===== Users =====
  async saveUser(user: User): Promise<void> {
    const { error } = await this.supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      created_at: user.createdAt,
    });

    if (error) {
      logger.error('Failed to save user', error);
      throw new InternalServerError('Failed to save user');
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      logger.error('Failed to get user', error);
      throw new InternalServerError('Failed to get user');
    }

    return this.mapToUser(data);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      logger.error('Failed to get user by email', error);
      throw new InternalServerError('Failed to get user by email');
    }

    return this.mapToUser(data);
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to get all users', error);
      throw new InternalServerError('Failed to get all users');
    }

    return data.map(this.mapToUser);
  }

  // ===== Admin Stats =====
  async getStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalItemsSold: number;
    totalDiscountsGiven: number;
    activeCouponCodes: number;
  }> {
    const orders = await this.getAllOrders();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalDiscounts = orders.reduce((sum, order) => sum + order.discount, 0);
    const totalItemsSold = orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
    const activeCoupons = await this.getActiveDiscountCodes();

    return {
      totalOrders: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalItemsSold,
      totalDiscountsGiven: Math.round(totalDiscounts * 100) / 100,
      activeCouponCodes: activeCoupons.length,
    };
  }

  // ===== Helper Methods =====
  private mapToProduct(data: SupabaseProduct): Product {
    return {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price.toString()),
      stock: data.stock,
      description: data.description,
      createdAt: new Date(data.created_at),
    };
  }

  private mapToOrder(orderData: SupabaseOrder, itemsData: SupabaseOrderItem[]): Order {
    return {
      id: orderData.id,
      userId: orderData.user_id,
      items: itemsData.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
      })),
      subtotal: parseFloat(orderData.subtotal.toString()),
      discount: parseFloat(orderData.discount.toString()),
      discountCode: orderData.discount_code,
      total: parseFloat(orderData.total.toString()),
      status: orderData.status as Order['status'],
      createdAt: new Date(orderData.created_at),
    };
  }

  private mapToDiscountCode(data: SupabaseDiscountCode): DiscountCode {
    return {
      code: data.code,
      discountPercent: parseFloat(data.discount_percent.toString()),
      isUsed: data.is_used,
      maxUses: data.max_uses,
      usageCount: data.usage_count,
      usedBy: data.used_by,
      usedAt: data.used_at ? new Date(data.used_at) : undefined,
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expires_at),
    };
  }

  private mapToUser(data: SupabaseUser): User {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role as 'customer' | 'admin',
      createdAt: new Date(data.created_at),
    };
  }
}
