import { Response } from 'express';
import { OrderModel } from '../models/Order';
import { AuthenticatedRequest } from '../types';

export class OrderController {
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const order = OrderModel.create(req.user.id);
      res.status(201).json(order);
    } catch (error) {
      const message = (error as Error).message;
      
      if (message.includes('Cart is empty')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Cannot create order with empty cart',
        });
      }
      
      if (message.includes('Insufficient stock')) {
        return res.status(400).json({
          error: 'Bad Request',
          message,
        });
      }

      res.status(500).json({
        error: 'Server Error',
        message,
      });
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const orders = OrderModel.findByUserId(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id, 10);
      const order = OrderModel.findById(id);

      if (!order) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Order not found',
        });
      }

      if (order.user_id !== req.user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied',
        });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }
}
