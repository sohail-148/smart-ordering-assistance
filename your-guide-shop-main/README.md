# Smart Ordering Assistance

An AI-powered e-commerce assistant that lets users browse products, get recommendations, and manage their cart through a natural language chat interface.

Built with React, Node.js, Express, SQLite, and the Groq API with RAG (Retrieval-Augmented Generation).

## Features

- 🤖 AI chat assistant powered by Groq API
- 🔍 RAG-based product search and recommendations
- 🛒 Cart management via chat commands
- 📦 Order placement and history
- 🔐 JWT-based user authentication
- 🌙 Dark / light mode
- 📱 Responsive design

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query

**Backend**
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3)
- JWT authentication
- Groq API (LLM)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/smart-ordering-assistance.git
cd smart-ordering-assistance
```

### 2. Set up the backend

```bash
cd backend-grok
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
JWT_SECRET=your-secret-key
GROK_API_KEY=your-groq-api-key
GROK_API_URL=https://api.groq.com/openai/v1
PORT=3001
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Backend runs at `http://localhost:3001`

### 3. Set up the frontend

```bash
cd ..
cp .env.example .env.local
```

`.env.local` should contain:

```env
VITE_API_URL=http://localhost:3001/api
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:8080`

## Deployment

- **Frontend** → [Vercel](https://vercel.com) — set `VITE_API_URL` to your backend URL
- **Backend** → [Render](https://render.com) — set env vars (`JWT_SECRET`, `GROK_API_KEY`, `ALLOWED_ORIGINS`)

The database auto-seeds 20 products on first boot.

## Project Structure

```
├── src/                  # Frontend (React)
│   ├── components/       # UI components
│   ├── pages/            # Route pages
│   └── lib/              # API client, types, utils
│
└── backend-grok/         # Backend (Node.js)
    └── src/
        ├── controllers/  # Route handlers
        ├── models/       # Database models
        ├── services/     # Groq & RAG services
        ├── middleware/   # Auth, validation
        └── config/       # DB & env config
```

## License

MIT
