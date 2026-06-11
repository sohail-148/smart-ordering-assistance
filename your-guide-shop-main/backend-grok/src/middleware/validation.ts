import { Request, Response, NextFunction } from 'express';

export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Email, password, and name are required',
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid email format',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Password must be at least 6 characters',
    });
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Email and password are required',
    });
  }

  next();
}

export function validateAddToCart(req: Request, res: Response, next: NextFunction) {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Product ID and quantity are required',
    });
  }

  if (quantity < 1) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Quantity must be at least 1',
    });
  }

  next();
}

export function validateChatMessage(req: Request, res: Response, next: NextFunction) {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Message is required and must be a string',
    });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Message cannot be empty',
    });
  }

  next();
}
