import { Request, Response } from 'express';
import { ProductModel } from '../models/Product';

export class ProductController {
  static async getAll(req: Request, res: Response) {
    try {
      const { search, category, minPrice, maxPrice } = req.query;

      const filters = {
        search: search as string | undefined,
        category: category as string | undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      };

      const products = ProductModel.findAll(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const product = ProductModel.findById(id);

      if (!product) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Product not found',
        });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }
}
