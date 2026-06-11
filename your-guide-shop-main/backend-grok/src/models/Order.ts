import { getDatabase } from '../config/database';
import { Order, OrderWithItems, OrderItemWithProduct } from '../types';
import { CartModel } from './Cart';
import { ProductModel } from './Product';

export class OrderModel {
  static create(userId: number): OrderWithItems {
    const db = getDatabase();
    const cart = CartModel.getWithItems(userId);
    
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // Check stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}`);
      }
    }
    
    // Create order
    const result = db.prepare(`
      INSERT INTO orders (user_id, total_amount, status)
      VALUES (?, ?, 'pending')
    `).run(userId, cart.total);
    
    const orderId = result.lastInsertRowid as number;
    
    // Create order items and update stock
    for (const item of cart.items) {
      db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES (?, ?, ?, ?)
      `).run(orderId, item.product_id, item.quantity, item.product.price);
      
      ProductModel.updateStock(item.product_id, item.quantity);
    }
    
    // Clear cart
    CartModel.clear(userId);
    
    return this.findById(orderId)!;
  }

  static findById(id: number): OrderWithItems | null {
    const db = getDatabase();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
    
    if (!order) return null;
    
    const items = db.prepare(`
      SELECT oi.*, p.*
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(id) as any[];
    
    const orderItems: OrderItemWithProduct[] = items.map(item => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
      product: {
        id: item.product_id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image_url: item.image_url,
        stock: item.stock,
        created_at: item.created_at,
      },
    }));
    
    return {
      ...order,
      items: orderItems,
    };
  }

  static findByUserId(userId: number): OrderWithItems[] {
    const db = getDatabase();
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as Order[];
    
    return orders.map(order => this.findById(order.id)!);
  }
}
