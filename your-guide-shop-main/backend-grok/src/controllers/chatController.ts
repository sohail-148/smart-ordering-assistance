import { Response } from 'express';
import { ChatHistoryModel } from '../models/ChatHistory';
import { RAGService } from '../services/ragService';
import { grokService } from '../services/grokService';
import { CartIntentService } from '../services/cartIntentService';
import { CartModel } from '../models/Cart';
import { AuthenticatedRequest, GrokMessage } from '../types';

export class ChatController {
  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { message } = req.body;

      // Save user message
      const userMessage = ChatHistoryModel.addMessage(req.user.id, message, 'user');

      // Check for cart intent first
      const cartIntent = CartIntentService.detectCartIntent(message);
      
      if (cartIntent) {
        // Get current cart items
        const cart = CartModel.getWithItems(req.user.id);
        
        // Generate cart response
        const cartResponse = CartIntentService.generateCartResponse(cartIntent, cart.items);
        
        // Handle cart actions
        if (cartResponse.cartAction) {
          const { type, productId, products } = cartResponse.cartAction;
          
          switch (type) {
            case 'add':
              if (productId) {
                CartModel.addItem(req.user.id, productId, 1);
              }
              break;
            case 'add_multiple':
              if (products && products.length > 0) {
                for (const product of products) {
                  CartModel.addItem(req.user.id, product.id, 1);
                }
              }
              break;
            case 'remove':
              if (productId) {
                // Find the cart item and remove it
                const itemToRemove = cart.items.find(item => item.product_id === productId);
                if (itemToRemove) {
                  CartModel.removeItem(itemToRemove.id);
                }
              }
              break;
            case 'remove_multiple':
              if (products && products.length > 0) {
                // Refresh cart to get current items
                const currentCart = CartModel.getWithItems(req.user.id);
                for (const product of products) {
                  const itemToRemove = currentCart.items.find(item => item.product_id === product.id);
                  if (itemToRemove) {
                    CartModel.removeItem(itemToRemove.id);
                  }
                }
              }
              break;
            case 'clear':
              CartModel.clear(req.user.id);
              break;
            // view and summary don't modify cart
          }
        }
        
        // Save assistant message
        ChatHistoryModel.addMessage(req.user.id, cartResponse.text, 'assistant');
        
        return res.json({
          message: cartResponse.text,
          products: [],
          cartAction: cartResponse.cartAction,
        });
      }

      // Get product context using RAG
      const productContext = await RAGService.getProductContext(message);

      // Get conversation history
      const conversationHistory = ChatHistoryModel.getConversationContext(req.user.id, 6);

      // Build messages for Grok API
      const grokMessages: GrokMessage[] = [
        {
          role: 'system',
          content: RAGService.buildSystemPrompt(),
        },
        {
          role: 'system',
          content: `Product Context:\n${productContext.contextString}`,
        },
      ];

      // Add recent conversation history (excluding the current message)
      conversationHistory.slice(0, -1).forEach(msg => {
        grokMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.message,
        });
      });

      // Add current user message
      grokMessages.push({
        role: 'user',
        content: message,
      });

      // Get response from Grok API
      let assistantResponse: string;
      
      try {
        assistantResponse = await grokService.chat(grokMessages);
      } catch (error) {
        console.error('Grok API error:', error);
        // Fallback response
        assistantResponse = ChatController.getFallbackResponse(message, productContext.products.length > 0);
      }

      // Save assistant message
      const assistantMessage = ChatHistoryModel.addMessage(
        req.user.id,
        assistantResponse,
        'assistant'
      );

      // Transform products to match frontend format
      const transformedProducts = productContext.products.map(p => ({
        id: p.id.toString(),
        name: p.name,
        category: p.category as any,
        price: p.price,
        rating: 4.5, // Default rating
        image: p.image_url || '/placeholder.svg',
        description: p.description,
        specs: {}, // Empty specs for now
        inStock: p.stock > 0,
      }));

      res.json({
        message: assistantResponse,
        products: transformedProducts,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const messages = ChatHistoryModel.getRecentMessages(req.user.id, 50);
      res.json(messages);
    } catch (error) {
      res.status(500).json({
        error: 'Server Error',
        message: (error as Error).message,
      });
    }
  }

  private static getFallbackResponse(message: string, hasProducts: boolean): string {
    const msg = message.toLowerCase();

    if (msg.includes('hello') || msg.includes('hi')) {
      return "Hello! I'm your shopping assistant. How can I help you find products today?";
    }

    if (msg.includes('help')) {
      return "I can help you find products, answer questions about our catalog, and provide recommendations. What are you looking for?";
    }

    if (hasProducts) {
      return "I found some products that might interest you. Would you like more details about any of them?";
    }

    return "I'm here to help you shop! You can ask me about products, compare items, or get recommendations. What are you looking for today?";
  }
}
