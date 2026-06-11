import { Response } from 'express';
import { CartModel } from '../models/Cart';
import { ProductModel } from '../models/Product';
import { AuthenticatedRequest } from '../types';

export class CartController {
  static async getCart(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const cart = CartModel.getWithItems(req.user.id);
      
      // Prevent caching of cart data
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.json(cart);
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }

  static async addItem(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { productId, quantity } = req.body;

      const product = ProductModel.findById(productId);
      if (!product) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Product not found',
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Insufficient stock',
        });
      }

      CartModel.addItem(req.user.id, productId, quantity);
      const cart = CartModel.getWithItems(req.user.id);

      res.json(cart);
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }

  static async updateItem(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const itemId = parseInt(req.params.id, 10);
      const { quantity } = req.body;

      if (quantity < 1) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Quantity must be at least 1',
        });
      }

      CartModel.updateItem(itemId, quantity);
      const cart = CartModel.getWithItems(req.user.id);

      res.json(cart);
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }

  static async removeItem(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const itemId = parseInt(req.params.id, 10);
      console.log('Backend: DELETE request received');
      console.log('Backend: req.params.id:', req.params.id);
      console.log('Backend: Parsed itemId:', itemId);
      console.log('Backend: itemId type:', typeof itemId);
      
      CartModel.removeItem(itemId);
      console.log('Backend: Item removed successfully');

      res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
      console.error('Backend: Error removing item:', error);
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }

  static async clearCart(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      CartModel.clear(req.user.id);
      res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }
}
