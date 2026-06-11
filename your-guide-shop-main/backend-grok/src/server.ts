import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { initializeDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import chatRoutes from './routes/chat';

const app = express();

// Initialize database
initializeDatabase();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(config.PORT, () => {
  console.log('🚀 Server running on port', config.PORT);
  console.log('📊 Environment:', config.NODE_ENV);
  console.log('🌐 CORS enabled for:', config.ALLOWED_ORIGINS.join(', '));
  console.log('🤖 Grok API URL:', config.GROK_API_URL);
  console.log('✅ API ready at http://localhost:' + config.PORT);
  console.log('\nAvailable endpoints:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  GET    /api/products');
  console.log('  GET    /api/products/:id');
  console.log('  GET    /api/cart');
  console.log('  POST   /api/cart/items');
  console.log('  PUT    /api/cart/items/:id');
  console.log('  DELETE /api/cart/items/:id');
  console.log('  DELETE /api/cart');
  console.log('  POST   /api/orders');
  console.log('  GET    /api/orders');
  console.log('  GET    /api/orders/:id');
  console.log('  POST   /api/chat');
  console.log('  GET    /api/chat/history');
});
