import { Request } from 'express';

// User types
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface UserPublic {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
  created_at: string;
}

// Cart types
export interface Cart {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
  total: number;
}

// Order types
export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

export interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
}

// Chat types
export interface ChatMessage {
  id: number;
  user_id: number;
  message: string;
  role: 'user' | 'assistant';
  created_at: string;
}

// Request types
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

// Grok API types
export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokChatRequest {
  model: string;
  messages: GrokMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface GrokChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// RAG types
export interface ProductContext {
  products: Product[];
  contextString: string;
}

// Cart Intent types
export interface CartIntent {
  action: 'add' | 'remove' | 'view' | 'clear' | 'summary';
  productQuery?: string;
}

export interface CartAction {
  type: 'add' | 'remove' | 'view' | 'clear' | 'summary' | 'add_multiple' | 'remove_multiple';
  productId?: number;
  product?: Product;
  products?: Product[];
}
