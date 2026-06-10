/**
 * In-memory repository implementation
 * Stores all data in memory - perfect for MVP and testing
 * Can be swapped with PostgreSQL repository later without changing business logic
 */

import { User, Product, Cart, Order, DiscountCode } from '../../shared/types';

export class InMemoryRepository {
  private users = new Map<string, User>();
  private products = new Map<string, Product>();
  private carts = new Map<string, Cart>();
  private orders: Order[] = [];
  private discountCodes = new Map<string, DiscountCode>();

  // Initialize with sample data
  constructor() {
    this.seedData();
  }

  /**
   * Seed initial product data
   */
  private seedData(): void {
    const sampleProducts: Product[] = [
      {
        id: 'prod_1',
        name: 'Laptop',
        price: 999.99,
        stock: 50,
        description: 'High performance laptop',
        createdAt: new Date(),
      },
      {
        id: 'prod_2',
        name: 'Wireless Mouse',
        price: 29.99,
        stock: 200,
        description: 'Ergonomic wireless mouse',
        createdAt: new Date(),
      },
      {
        id: 'prod_3',
        name: 'Mechanical Keyboard',
        price: 149.99,
        stock: 100,
        description: 'RGB mechanical keyboard',
        createdAt: new Date(),
      },
      {
        id: 'prod_4',
        name: 'USB-C Cable',
        price: 12.99,
        stock: 500,
        description: '3ft USB-C charging cable',
        createdAt: new Date(),
      },
      {
        id: 'prod_5',
        name: 'Monitor Stand',
        price: 49.99,
        stock: 75,
        description: 'Adjustable monitor stand',
        createdAt: new Date(),
      },
    ];

    sampleProducts.forEach((product) => {
      this.products.set(product.id, product);
    });
  }

  // ===== Products =====
  saveProduct(product: Product): void {
    this.products.set(product.id, product);
  }

  getProduct(id: string): Product | undefined {
    return this.products.get(id);
  }

  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  updateProductStock(productId: string, quantity: number): void {
    const product = this.products.get(productId);
    if (product) {
      product.stock = Math.max(0, product.stock - quantity);
    }
  }

  // ===== Carts =====
  saveCart(cart: Cart): void {
    this.carts.set(cart.id, cart);
  }

  getCart(id: string): Cart | undefined {
    return this.carts.get(id);
  }

  deleteCart(id: string): void {
    this.carts.delete(id);
  }

  // ===== Orders =====
  saveOrder(order: Order): void {
    this.orders.push(order);
  }

  getOrder(id: string): Order | undefined {
    return this.orders.find((order) => order.id === id);
  }

  getAllOrders(): Order[] {
    return [...this.orders];
  }

  getOrdersByUserId(userId: string): Order[] {
    return this.orders.filter((order) => order.userId === userId);
  }

  getOrderCount(): number {
    return this.orders.length;
  }

  getOrderCountByUser(userId: string): number {
    return this.orders.filter((order) => order.userId === userId).length;
  }

  getTotalRevenue(): number {
    return this.orders.reduce((total, order) => total + order.total, 0);
  }

  getTotalDiscounts(): number {
    return this.orders.reduce((total, order) => total + order.discount, 0);
  }

  // ===== Discount Codes =====
  saveDiscountCode(code: DiscountCode): void {
    this.discountCodes.set(code.code, code);
  }

  getDiscountCode(code: string): DiscountCode | undefined {
    return this.discountCodes.get(code);
  }

  updateDiscountCode(code: DiscountCode): void {
    this.discountCodes.set(code.code, code);
  }

  getAllDiscountCodes(): DiscountCode[] {
    return Array.from(this.discountCodes.values());
  }

  getActiveDiscountCodes(): DiscountCode[] {
    const now = new Date();
    return Array.from(this.discountCodes.values()).filter(
      (code) => !code.isUsed && code.expiresAt > now
    );
  }

  // ===== Users =====
  saveUser(user: User): void {
    this.users.set(user.id, user);
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  // ===== Admin Stats =====
  getStats(): {
    totalOrders: number;
    totalRevenue: number;
    totalItemsSold: number;
    totalDiscountsGiven: number;
    activeCouponCodes: number;
  } {
    let totalItemsSold = 0;

    for (const order of this.orders) {
      totalItemsSold += order.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    return {
      totalOrders: this.orders.length,
      totalRevenue: Math.round(this.getTotalRevenue() * 100) / 100,
      totalItemsSold,
      totalDiscountsGiven: Math.round(this.getTotalDiscounts() * 100) / 100,
      activeCouponCodes: this.getActiveDiscountCodes().length,
    };
  }

  // ===== Clear (for testing) =====
  clear(): void {
    this.users.clear();
    this.products.clear();
    this.carts.clear();
    this.orders = [];
    this.discountCodes.clear();
    this.seedData(); // Re-seed products
  }
}

// Export singleton instance
export const repository = new InMemoryRepository();
