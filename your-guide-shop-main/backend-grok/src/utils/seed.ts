import { initializeDatabase, getDatabase } from '../config/database';
import { UserModel } from '../models/User';

const products = [
  {
    name: "AuraSound Pro Headphones",
    description: "Premium wireless headphones with adaptive noise cancellation and spatial audio. 40-hour battery life.",
    price: 249.99,
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    stock: 50
  },
  {
    name: "NovaPad Ultra Tablet",
    description: "12.9\" OLED display tablet with M3 chip, perfect for creative professionals. 256GB storage.",
    price: 599.00,
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80",
    stock: 30
  },
  {
    name: "PixelLens 4K Camera",
    description: "Mirrorless camera with 4K video, 45MP sensor, and AI autofocus. Professional quality.",
    price: 899.00,
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
    stock: 20
  },
  {
    name: "Cloud Walker Sneakers",
    description: "Ultralight running sneakers with responsive foam and breathable knit upper. Sizes 6-14.",
    price: 129.99,
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    stock: 100
  },
  {
    name: "Arctic Shell Jacket",
    description: "Waterproof insulated jacket for extreme cold with recycled materials. 800-fill down.",
    price: 289.00,
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
    stock: 45
  },
  {
    name: "RoboBuilder Kit",
    description: "STEM robotics kit with 300+ pieces, app-controlled, ages 8+. Educational and fun.",
    price: 79.99,
    category: "toys",
    image_url: "https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=400&q=80",
    stock: 75
  },
  {
    name: "Cosmic Explorer Telescope",
    description: "Beginner telescope with smartphone adapter and star-finding app. 70mm aperture.",
    price: 159.00,
    category: "toys",
    image_url: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&q=80",
    stock: 0
  },
  {
    name: "ZenBrew Coffee Maker",
    description: "Smart pour-over coffee maker with temperature control and scheduling. WiFi enabled.",
    price: 199.00,
    category: "lifestyle",
    image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
    stock: 60
  },
  {
    name: "LumiScape Smart Lamp",
    description: "Adaptive desk lamp with circadian rhythm lighting and wireless charging base.",
    price: 89.99,
    category: "lifestyle",
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&q=80",
    stock: 80
  },
  {
    name: "UltraFit Smartwatch",
    description: "Fitness tracking smartwatch with heart rate monitor, GPS, and 7-day battery life.",
    price: 299.00,
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    stock: 40
  },
  {
    name: "EcoFlow Water Bottle",
    description: "Insulated stainless steel water bottle keeps drinks cold for 24 hours. 32oz capacity.",
    price: 34.99,
    category: "lifestyle",
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
    stock: 150
  },
  {
    name: "PowerBank Pro 20000",
    description: "High-capacity portable charger with fast charging and multiple USB ports.",
    price: 49.99,
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80",
    stock: 90
  },
  {
    name: "Comfort Plus Backpack",
    description: "Ergonomic laptop backpack with USB charging port and water-resistant material.",
    price: 79.99,
    category: "lifestyle",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
    stock: 70
  },
  {
    name: "Yoga Mat Premium",
    description: "Extra thick non-slip yoga mat with carrying strap. Eco-friendly materials.",
    price: 44.99,
    category: "lifestyle",
    image_url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80",
    stock: 120
  },
  {
    name: "Gaming Mouse RGB",
    description: "High-precision gaming mouse with customizable RGB lighting and programmable buttons.",
    price: 69.99,
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80",
    stock: 85
  },
  {
    name: "Wireless Keyboard",
    description: "Mechanical wireless keyboard with backlit keys and long battery life.",
    price: 119.99,
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80",
    stock: 65
  },
  {
    name: "Denim Jacket Classic",
    description: "Timeless denim jacket with comfortable fit. Available in multiple sizes.",
    price: 89.99,
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&q=80",
    stock: 55
  },
  {
    name: "Running Shorts Pro",
    description: "Lightweight running shorts with moisture-wicking fabric and zippered pocket.",
    price: 39.99,
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80",
    stock: 95
  },
  {
    name: "Building Blocks Set",
    description: "Creative building blocks set with 500 pieces. Compatible with major brands.",
    price: 49.99,
    category: "toys",
    image_url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80",
    stock: 110
  },
  {
    name: "Art Supplies Kit",
    description: "Complete art supplies kit with paints, brushes, and canvas. Perfect for beginners.",
    price: 64.99,
    category: "toys",
    image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
    stock: 45
  }
];

async function seed() {
  console.log('Starting database seed...');
  
  // Initialize database
  initializeDatabase();
  const db = getDatabase();
  
  // Clear existing data
  console.log('Clearing existing data...');
  db.prepare('DELETE FROM chat_history').run();
  db.prepare('DELETE FROM order_items').run();
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM cart_items').run();
  db.prepare('DELETE FROM carts').run();
  db.prepare('DELETE FROM products').run();
  db.prepare('DELETE FROM users').run();
  
  // Create test users
  console.log('Creating test users...');
  try {
    UserModel.create('admin@shop.com', 'admin123', 'Admin User');
    console.log('✓ Created admin user: admin@shop.com / admin123');
  } catch (e) {
    console.log('Admin user already exists');
  }
  
  try {
    UserModel.create('user@shop.com', 'user123', 'Test User');
    console.log('✓ Created test user: user@shop.com / user123');
  } catch (e) {
    console.log('Test user already exists');
  }
  
  // Insert products
  console.log('Inserting products...');
  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, category, image_url, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  for (const product of products) {
    stmt.run(
      product.name,
      product.description,
      product.price,
      product.category,
      product.image_url,
      product.stock
    );
    console.log(`✓ Created product: ${product.name}`);
  }
  
  console.log('\n✅ Database seeded successfully!');
  console.log('\nTest credentials:');
  console.log('  Admin: admin@shop.com / admin123');
  console.log('  User:  user@shop.com / user123');
  console.log(`\nTotal products: ${products.length}`);
}

// Run seed if executed directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export default seed;
