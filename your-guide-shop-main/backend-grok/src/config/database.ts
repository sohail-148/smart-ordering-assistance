import Database from 'better-sqlite3';
import { config } from './env';
import path from 'path';
import fs from 'fs';

let db: Database.Database;

export function initializeDatabase(): Database.Database {
  // Ensure data directory exists
  const dataDir = path.dirname(config.DATABASE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(config.DATABASE_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log(`Database connected: ${config.DATABASE_PATH}`);

  createTables();
  autoSeedProducts();

  return db;
}

function createTables() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Carts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Cart items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cart_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Order items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_purchase REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Chat history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database schema initialized');
}

// Auto-seed products on first boot if the table is empty
function autoSeedProducts() {
  const count = (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count;
  if (count > 0) return;

  console.log('No products found — seeding initial product catalog...');

  const products = [
    { name: "AuraSound Pro Headphones", description: "Premium wireless headphones with adaptive noise cancellation and spatial audio. 40-hour battery life.", price: 249.99, category: "electronics", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", stock: 50 },
    { name: "NovaPad Ultra Tablet", description: "12.9\" OLED display tablet with M3 chip, perfect for creative professionals. 256GB storage.", price: 599.00, category: "electronics", image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80", stock: 30 },
    { name: "PixelLens 4K Camera", description: "Mirrorless camera with 4K video, 45MP sensor, and AI autofocus. Professional quality.", price: 899.00, category: "electronics", image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80", stock: 20 },
    { name: "Cloud Walker Sneakers", description: "Ultralight running sneakers with responsive foam and breathable knit upper. Sizes 6-14.", price: 129.99, category: "clothing", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", stock: 100 },
    { name: "Arctic Shell Jacket", description: "Waterproof insulated jacket for extreme cold with recycled materials. 800-fill down.", price: 289.00, category: "clothing", image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80", stock: 45 },
    { name: "RoboBuilder Kit", description: "STEM robotics kit with 300+ pieces, app-controlled, ages 8+. Educational and fun.", price: 79.99, category: "toys", image_url: "https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=400&q=80", stock: 75 },
    { name: "Cosmic Explorer Telescope", description: "Beginner telescope with smartphone adapter and star-finding app. 70mm aperture.", price: 159.00, category: "toys", image_url: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&q=80", stock: 0 },
    { name: "ZenBrew Coffee Maker", description: "Smart pour-over coffee maker with temperature control and scheduling. WiFi enabled.", price: 199.00, category: "lifestyle", image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", stock: 60 },
    { name: "LumiScape Smart Lamp", description: "Adaptive desk lamp with circadian rhythm lighting and wireless charging base.", price: 89.99, category: "lifestyle", image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&q=80", stock: 80 },
    { name: "UltraFit Smartwatch", description: "Fitness tracking smartwatch with heart rate monitor, GPS, and 7-day battery life.", price: 299.00, category: "electronics", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", stock: 40 },
    { name: "EcoFlow Water Bottle", description: "Insulated stainless steel water bottle keeps drinks cold for 24 hours. 32oz capacity.", price: 34.99, category: "lifestyle", image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80", stock: 150 },
    { name: "PowerBank Pro 20000", description: "High-capacity portable charger with fast charging and multiple USB ports.", price: 49.99, category: "electronics", image_url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80", stock: 90 },
    { name: "Comfort Plus Backpack", description: "Ergonomic laptop backpack with USB charging port and water-resistant material.", price: 79.99, category: "lifestyle", image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80", stock: 70 },
    { name: "Yoga Mat Premium", description: "Extra thick non-slip yoga mat with carrying strap. Eco-friendly materials.", price: 44.99, category: "lifestyle", image_url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80", stock: 120 },
    { name: "Gaming Mouse RGB", description: "High-precision gaming mouse with customizable RGB lighting and programmable buttons.", price: 69.99, category: "electronics", image_url: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80", stock: 85 },
    { name: "Wireless Keyboard", description: "Mechanical wireless keyboard with backlit keys and long battery life.", price: 119.99, category: "electronics", image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80", stock: 65 },
    { name: "Denim Jacket Classic", description: "Timeless denim jacket with comfortable fit. Available in multiple sizes.", price: 89.99, category: "clothing", image_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&q=80", stock: 55 },
    { name: "Running Shorts Pro", description: "Lightweight running shorts with moisture-wicking fabric and zippered pocket.", price: 39.99, category: "clothing", image_url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80", stock: 95 },
    { name: "Building Blocks Set", description: "Creative building blocks set with 500 pieces. Compatible with major brands.", price: 49.99, category: "toys", image_url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80", stock: 110 },
    { name: "Art Supplies Kit", description: "Complete art supplies kit with paints, brushes, and canvas. Perfect for beginners.", price: 64.99, category: "toys", image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80", stock: 45 },
  ];

  const stmt = db.prepare(
    'INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (const p of products) {
    stmt.run(p.name, p.description, p.price, p.category, p.image_url, p.stock);
  }

  console.log(`Seeded ${products.length} products.`);
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}
