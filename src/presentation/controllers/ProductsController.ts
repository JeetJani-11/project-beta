/**
 * Products controller - handles product listings
 */

import { Request, Response } from 'express';
import { repository } from '../../infrastructure/repositories/InMemoryRepository';
import { NotFoundError } from '../../shared/errors';
import { APIResponse } from '../../shared/types';

export class ProductsController {
  /**
   * Get all products
   */
  static async getAll(req: Request, res: Response): Promise<Response> {
    const products = repository.getAllProducts();

    const response: APIResponse = {
      success: true,
      data: products,
    };

    return res.json(response);
  }

  /**
   * Get product by ID
   */
  static async getById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const product = repository.getProduct(id);
    if (!product) {
      throw new NotFoundError('Product', id);
    }

    const response: APIResponse = {
      success: true,
      data: product,
    };

    return res.json(response);
  }
}
