import { getDatabase } from '../config/database';
import { Cart, CartItem, CartItemWithProduct, CartWithItems } from '../types';
import { ProductModel } from './Product';

export class CartModel {
  static findOrCreateByUserId(userId: number): Cart {
    const db = getDatabase();
    
    let cart = db.prepare('SELECT * FROM carts WHERE user_id = ?').get(userId) as Cart | undefined;
    
    if (!cart) {
      const result = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(userId);
      cart = db.prepare('SELECT * FROM carts WHERE id = ?').get(result.lastInsertRowid) as Cart;
    }
    
    return cart;
  }

  static getWithItems(userId: number): CartWithItems {
    const cart = this.findOrCreateByUserId(userId);
    const db = getDatabase();
    
    const items = db.prepare(`
      SELECT 
        ci.id as cart_item_id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.description,
        p.price,
        p.category,
        p.image_url,
        p.stock,
        p.created_at
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `).all(cart.id) as any[];
    
    const cartItems: CartItemWithProduct[] = items.map(item => ({
      id: item.cart_item_id,
      cart_id: item.cart_id,
      product_id: item.product_id,
      quantity: item.quantity,
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
    
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    return {
      ...cart,
      items: cartItems,
      total,
    };
  }

  static addItem(userId: number, productId: number, quantity: number): void {
    const cart = this.findOrCreateByUserId(userId);
    const db = getDatabase();
    
    const existing = db.prepare('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?')
      .get(cart.id, productId) as CartItem | undefined;
    
    if (existing) {
      db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?')
        .run(quantity, existing.id);
    } else {
      db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)')
        .run(cart.id, productId, quantity);
    }
    
    db.prepare('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(cart.id);
  }

  static updateItem(itemId: number, quantity: number): void {
    const db = getDatabase();
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, itemId);
  }

  static removeItem(itemId: number): void {
    const db = getDatabase();
    console.log('CartModel: Attempting to delete cart item with ID:', itemId);
    
    // Get cart_id before deleting
    const cartItem = db.prepare('SELECT cart_id FROM cart_items WHERE id = ?').get(itemId) as { cart_id: number } | undefined;
    
    if (!cartItem) {
      console.log('CartModel: Item not found with ID:', itemId);
      return;
    }
    
    const result = db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
    console.log('CartModel: Delete result:', result);
    console.log('CartModel: Changes made:', result.changes);
    
    // Update cart timestamp to ensure change is visible
    db.prepare('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(cartItem.cart_id);
    
    // Force WAL checkpoint to ensure changes are immediately visible
    db.pragma('wal_checkpoint(PASSIVE)');
    console.log('CartModel: WAL checkpoint executed');
  }

  static clear(userId: number): void {
    const cart = this.findOrCreateByUserId(userId);
    const db = getDatabase();
    db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id);
    
    // Update cart timestamp
    db.prepare('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(cart.id);
    
    // Force WAL checkpoint to ensure changes are immediately visible
    db.pragma('wal_checkpoint(PASSIVE)');
  }
}
