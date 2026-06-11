export interface Product {
  id: string;
  name: string;
  category: "electronics" | "clothing" | "toys" | "lifestyle";
  price: number;
  rating: number;
  image: string;
  description: string;
  specs: Record<string, string>;
  inStock: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  timestamp: Date;
}

export type Category = "all" | "electronics" | "clothing" | "toys" | "lifestyle";

export interface CartAction {
  type: 'add' | 'remove' | 'view' | 'clear' | 'summary';
  productId?: string;
  product?: Product;
}

export interface CartIntent {
  action: 'add' | 'remove' | 'view' | 'clear' | 'summary';
  productQuery?: string;
}

export interface AssistantResponse {
  text: string;
  products?: Product[];
  cartAction?: CartAction;
}
