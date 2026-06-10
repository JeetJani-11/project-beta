/**
 * Core type definitions for the ecommerce system
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional - may not be returned in API responses
  role?: 'customer' | 'admin'; // User role for authorization
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  createdAt: Date;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number; // Price at time of adding to cart
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  createdAt: Date;
  expiresAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface DiscountCode {
  code: string;
  discountPercent: number;
  isUsed: boolean;
  createdAt: Date;
  expiresAt: Date;
  usedBy?: string;
  usedAt?: Date;
  maxUses?: number;
  usageCount?: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: Date;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
