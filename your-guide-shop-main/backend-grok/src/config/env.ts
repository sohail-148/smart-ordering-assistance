import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

interface Config {
  PORT: number;
  NODE_ENV: string;
  DATABASE_PATH: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  GROK_API_KEY: string;
  GROK_API_URL: string;
  ALLOWED_ORIGINS: string[];
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const requiredEnvVars = ['JWT_SECRET', 'GROK_API_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Required environment variable ${envVar} is not set`);
    process.exit(1);
  }
}

export const config: Config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_PATH: process.env.DATABASE_PATH || path.join(__dirname, '../../data/ecommerce.db'),
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GROK_API_KEY: process.env.GROK_API_KEY!,
  GROK_API_URL: process.env.GROK_API_URL || 'https://api.x.ai/v1',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'],
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};
