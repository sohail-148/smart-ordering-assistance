import { getDatabase } from '../config/database';
import { Product } from '../types';

export class ProductModel {
  static findAll(filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Product[] {
    const db = getDatabase();
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (filters?.search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.minPrice !== undefined) {
      query += ' AND price >= ?';
      params.push(filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query += ' AND price <= ?';
      params.push(filters.maxPrice);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params) as Product[];
  }

  static findById(id: number): Product | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    return stmt.get(id) as Product | null;
  }

  static searchForRAG(query: string, limit: number = 5): Product[] {
    const db = getDatabase();
    
    // Split query into individual terms for better matching
    const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    if (terms.length === 0) {
      return [];
    }
    
    // Build dynamic query with OR conditions for each term
    let whereConditions: string[] = [];
    let params: any[] = [];
    
    terms.forEach(term => {
      const searchTerm = `%${term}%`;
      whereConditions.push('(name LIKE ? OR description LIKE ? OR category LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm);
    });
    
    // Join conditions with OR to match any term
    const whereClause = whereConditions.join(' OR ');
    
    const stmt = db.prepare(`
      SELECT *, 
        CASE 
          WHEN name LIKE ? THEN 1
          WHEN description LIKE ? THEN 2
          WHEN category LIKE ? THEN 3
          ELSE 4
        END as relevance_score
      FROM products 
      WHERE ${whereClause}
      ORDER BY relevance_score ASC, created_at DESC
      LIMIT ?
    `);
    
    // Add ordering parameters (use first term for ordering)
    const firstTerm = `%${terms[0]}%`;
    params.push(firstTerm, firstTerm, firstTerm, limit);
    
    return stmt.all(...params) as Product[];
  }

  static updateStock(id: number, quantity: number): void {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    stmt.run(quantity, id);
  }
}
