import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { config } from '../config/env';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      const existingUser = UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists',
        });
      }

      const user = UserModel.create(email, password, name);
      
      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: UserModel.toPublic(user),
        token,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = UserModel.findByEmail(email);
      if (!user || !UserModel.verifyPassword(user, password)) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: UserModel.toPublic(user),
        token,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }

  static async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Not authenticated',
        });
      }

      const user = UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      res.json(UserModel.toPublic(user));
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }
}
