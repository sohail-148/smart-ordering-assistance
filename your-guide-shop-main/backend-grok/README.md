# E-commerce Backend with RAG and Grok API

Complete backend system with Retrieval-Augmented Generation (RAG) and Grok API integration for an AI-powered shopping assistant.

## Features

- ✅ Express.js + TypeScript REST API
- ✅ SQLite database with better-sqlite3
- ✅ JWT authentication
- ✅ Product search and filtering
- ✅ Shopping cart management
- ✅ Order processing
- ✅ RAG system for intelligent product retrieval
- ✅ Grok API integration for AI chat
- ✅ Rate limiting and security middleware
- ✅ CORS configuration

## Prerequisites

- Node.js 18+ and npm
- Grok API key from xAI (https://x.ai/)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Grok API key:
```
GROK_API_KEY=your-actual-grok-api-key-here
```

3. Seed the database:
```bash
npm run seed
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Products
- `GET /api/products` - Get all products (supports filtering)
- `GET /api/products/:id` - Get product by ID

### Cart
- `GET /api/cart` - Get user's cart (requires auth)
- `POST /api/cart/items` - Add item to cart (requires auth)
- `PUT /api/cart/items/:id` - Update cart item (requires auth)
- `DELETE /api/cart/items/:id` - Remove cart item (requires auth)
- `DELETE /api/cart` - Clear cart (requires auth)

### Orders
- `POST /api/orders` - Create order from cart (requires auth)
- `GET /api/orders` - Get user's orders (requires auth)
- `GET /api/orders/:id` - Get order by ID (requires auth)

### Chat
- `POST /api/chat` - Send message to AI assistant (requires auth)
- `GET /api/chat/history` - Get chat history (requires auth)

## Test Credentials

After seeding, you can use these credentials:

- **Admin**: admin@shop.com / admin123
- **User**: user@shop.com / user123

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| DATABASE_PATH | SQLite database path | ./data/ecommerce.db |
| JWT_SECRET | JWT signing secret | (required) |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| GROK_API_KEY | Grok API key | (required) |
| GROK_API_URL | Grok API URL | https://api.x.ai/v1 |
| ALLOWED_ORIGINS | CORS allowed origins | http://localhost:8080 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 (15 min) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |

## How RAG Works

1. User sends a chat message
2. RAG system extracts key terms from the message
3. System searches the product database for relevant items
4. Top 5 matching products are retrieved
5. Product context is formatted and sent to Grok API
6. Grok generates a response using the product context
7. Response is saved to chat history and returned to user

## Project Structure

```
backend-grok/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (RAG, Grok)
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities (seed script)
│   └── server.ts        # Main server file
├── data/                # SQLite database (created on first run)
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- Input validation
- SQL injection prevention
- CORS protection

## Troubleshooting

### "Required environment variable GROK_API_KEY is not set"
Make sure you've created a `.env` file and added your Grok API key.

### "Database not initialized"
The database is automatically created on first run. Make sure the `data/` directory is writable.

### "Grok API error: 401"
Your Grok API key is invalid or expired. Check your key at https://x.ai/

### CORS errors
Add your frontend URL to the `ALLOWED_ORIGINS` environment variable in `.env`.

## License

MIT
