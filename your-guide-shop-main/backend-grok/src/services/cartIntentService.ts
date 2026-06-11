import { ProductModel } from '../models/Product';
import { CartIntent, CartAction, Product } from '../types';

export class CartIntentService {
  /**
   * Detect cart-related intent from user message
   */
  static detectCartIntent(message: string): CartIntent | null {
    const msg = message.toLowerCase().trim();
    
    // Define regex patterns for each command type
    const ADD_PATTERNS = [
      /add\s+(.+?)\s+(?:to|in)(?:\s+(?:my|the))?\s+(?:cart|order)/,
      /put\s+(.+?)\s+(?:in|into)(?:\s+(?:my|the))?\s+(?:cart|order)/,
      /include\s+(.+?)\s+(?:in|into)(?:\s+(?:my|the))?\s+(?:cart|order)/,
      /i\s+want\s+(.+)/,
      /get\s+me\s+(.+)/,
    ];
    
    const REMOVE_PATTERNS = [
      /remove\s+(.+?)\s+from(?:\s+(?:my|the))?\s+cart/,
      /remove\s+(.+?)$/,  // "remove robo and aurasound"
      /delete\s+(.+?)(?:\s+from(?:\s+(?:my|the))?\s+cart)?$/,
      /take\s+out\s+(.+?)(?:\s+from(?:\s+(?:my|the))?\s+cart)?$/,
      /don'?t\s+want\s+(.+)/,
    ];
    
    const VIEW_PATTERNS = [
      /show(?:\s+(?:my|the))?\s+cart/,
      /view(?:\s+(?:my|the))?\s+cart/,
      /what'?s\s+in(?:\s+(?:my|the))?\s+cart/,
      /see(?:\s+(?:my|the))?\s+cart/,
      /cart\s+contents/,
    ];
    
    const CLEAR_PATTERNS = [
      /clear(?:\s+(?:my|the))?\s+cart/,
      /empty(?:\s+(?:my|the))?\s+cart/,
      /remove\s+all/,
      /delete\s+(?:everything|all)/,
    ];
    
    const SUMMARY_PATTERNS = [
      /cart\s+total/,
      /how\s+much/,
      /(?:total\s+)?price/,
      /what'?s\s+(?:my|the)\s+total/,
    ];
    
    // Check patterns in priority order
    // Check clear patterns first (to avoid false positives with remove)
    for (const pattern of CLEAR_PATTERNS) {
      if (pattern.test(msg)) {
        return { action: 'clear' };
      }
    }
    
    // Check view patterns
    for (const pattern of VIEW_PATTERNS) {
      if (pattern.test(msg)) {
        return { action: 'view' };
      }
    }
    
    // Check summary patterns
    for (const pattern of SUMMARY_PATTERNS) {
      if (pattern.test(msg)) {
        return { action: 'summary' };
      }
    }
    
    // Check add patterns
    for (const pattern of ADD_PATTERNS) {
      const match = msg.match(pattern);
      if (match) {
        const productQuery = match[1]?.trim();
        return { 
          action: 'add', 
          productQuery: productQuery || undefined 
        };
      }
    }
    
    // Check remove patterns
    for (const pattern of REMOVE_PATTERNS) {
      const match = msg.match(pattern);
      if (match) {
        const productQuery = match[1]?.trim();
        return { 
          action: 'remove', 
          productQuery: productQuery || undefined 
        };
      }
    }
    
    return null;
  }

  /**
   * Match product by name or description
   */
  static matchProduct(query: string): Product | Product[] | null {
    const normalized = query.toLowerCase().trim();
    
    // Get all products
    const allProducts = ProductModel.findAll({});
    
    // Exact match
    const exactMatch = allProducts.find(p => 
      p.name.toLowerCase() === normalized
    );
    if (exactMatch) return exactMatch;
    
    // Partial matches
    const partialMatches = allProducts.filter(p =>
      p.name.toLowerCase().includes(normalized) ||
      normalized.split(' ').some(word => 
        word.length > 3 && p.name.toLowerCase().includes(word)
      )
    );
    
    if (partialMatches.length === 1) return partialMatches[0];
    if (partialMatches.length > 1) return partialMatches;
    return null;
  }

  /**
   * Generate cart action response
   */
  static generateCartResponse(
    intent: CartIntent,
    currentCartItems: any[]
  ): { text: string; cartAction?: CartAction } {
    const { action, productQuery } = intent;

    switch (action) {
      case 'add': {
        if (!productQuery) {
          return { text: "Which product would you like to add to your cart?" };
        }

        // Check if multiple products are requested (comma-separated)
        const queries = productQuery.split(',').map(q => q.trim()).filter(q => q.length > 0);
        
        if (queries.length > 1) {
          // Handle multiple products
          const results: { product: Product; success: boolean; reason?: string }[] = [];
          
          for (const query of queries) {
            const matchResult = this.matchProduct(query);
            
            if (!matchResult) {
              results.push({ product: null as any, success: false, reason: `Couldn't find '${query}'` });
            } else if (Array.isArray(matchResult)) {
              results.push({ product: null as any, success: false, reason: `'${query}' matches multiple products` });
            } else if (matchResult.stock === 0) {
              results.push({ product: matchResult, success: false, reason: 'Out of stock' });
            } else {
              results.push({ product: matchResult, success: true });
            }
          }
          
          const successful = results.filter(r => r.success);
          const failed = results.filter(r => !r.success);
          
          if (successful.length === 0) {
            const reasons = failed.map(f => f.reason).join(', ');
            return { text: `Couldn't add any items: ${reasons}` };
          }
          
          // Return action for multiple products
          let responseText = '';
          if (successful.length === queries.length) {
            const names = successful.map(r => r.product.name).join(', ');
            responseText = `Added ${successful.length} items to your cart: ${names}! 🛒`;
          } else {
            const successNames = successful.map(r => r.product.name).join(', ');
            const failReasons = failed.map(f => f.reason).join('; ');
            responseText = `Added ${successful.length} item(s): ${successNames}. Failed: ${failReasons}`;
          }
          
          return {
            text: responseText,
            cartAction: {
              type: 'add_multiple',
              products: successful.map(r => r.product)
            }
          };
        }

        // Single product logic (existing code)
        const matchResult = this.matchProduct(productQuery);
        
        if (!matchResult) {
          return { 
            text: `I couldn't find '${productQuery}'. Try being more specific or browse our catalog!` 
          };
        }

        if (Array.isArray(matchResult)) {
          const names = matchResult.map(p => p.name).join(', ');
          return { 
            text: `I found multiple products matching '${productQuery}': ${names}. Which one did you mean?` 
          };
        }

        // Check stock
        if (matchResult.stock === 0) {
          return {
            text: `I'm sorry, but ${matchResult.name} is currently out of stock. Would you like me to suggest similar products?`
          };
        }

        return {
          text: `Added ${matchResult.name} to your cart! 🛒`,
          cartAction: {
            type: 'add',
            productId: matchResult.id,
            product: matchResult
          }
        };
      }

      case 'remove': {
        if (!productQuery) {
          return { text: "Which product would you like to remove from your cart?" };
        }

        // Check if multiple products are requested (comma or "and" separated)
        const queries = productQuery
          .split(/[,]|\s+and\s+/)
          .map(q => q.trim())
          .filter(q => q.length > 0);
        
        if (queries.length > 1) {
          // Handle multiple products
          const results: { product: Product; success: boolean; reason?: string }[] = [];
          
          for (const query of queries) {
            const matchResult = this.matchProduct(query);
            
            if (!matchResult) {
              results.push({ product: null as any, success: false, reason: `Couldn't find '${query}'` });
            } else if (Array.isArray(matchResult)) {
              results.push({ product: null as any, success: false, reason: `'${query}' matches multiple products` });
            } else {
              // Check if product is in cart
              const inCart = currentCartItems.some(item => item.product_id === matchResult.id);
              if (!inCart) {
                results.push({ product: matchResult, success: false, reason: `${matchResult.name} not in cart` });
              } else {
                results.push({ product: matchResult, success: true });
              }
            }
          }
          
          const successful = results.filter(r => r.success);
          const failed = results.filter(r => !r.success);
          
          if (successful.length === 0) {
            const reasons = failed.map(f => f.reason).join(', ');
            return { text: `Couldn't remove any items: ${reasons}` };
          }
          
          // Return action for multiple products
          let responseText = '';
          if (successful.length === queries.length) {
            const names = successful.map(r => r.product.name).join(', ');
            responseText = `Removed ${successful.length} items from your cart: ${names}.`;
          } else {
            const successNames = successful.map(r => r.product.name).join(', ');
            const failReasons = failed.map(f => f.reason).join('; ');
            responseText = `Removed ${successful.length} item(s): ${successNames}. Failed: ${failReasons}`;
          }
          
          return {
            text: responseText,
            cartAction: {
              type: 'remove_multiple',
              products: successful.map(r => r.product)
            }
          };
        }

        // Single product logic
        const matchResult = this.matchProduct(productQuery);
        
        if (!matchResult) {
          return { 
            text: `I couldn't find '${productQuery}' in our catalog.` 
          };
        }

        if (Array.isArray(matchResult)) {
          const names = matchResult.map(p => p.name).join(', ');
          return { 
            text: `I found multiple products: ${names}. Which one did you want to remove?` 
          };
        }

        // Check if product is in cart
        const inCart = currentCartItems.some(item => item.product_id === matchResult.id);
        if (!inCart) {
          return { 
            text: `${matchResult.name} isn't in your cart. Want to add it instead?` 
          };
        }

        return {
          text: `Removed ${matchResult.name} from your cart.`,
          cartAction: {
            type: 'remove',
            productId: matchResult.id,
            product: matchResult
          }
        };
      }

      case 'view': {
        if (currentCartItems.length === 0) {
          return { 
            text: "Your cart is empty. Start shopping!",
            cartAction: { type: 'view' }
          };
        }

        return {
          text: `Your cart has ${currentCartItems.length} item(s). Opening cart view...`,
          cartAction: { type: 'view' }
        };
      }

      case 'clear': {
        if (currentCartItems.length === 0) {
          return { 
            text: "Your cart is already empty!",
            cartAction: { type: 'clear' }
          };
        }

        return {
          text: "Cleared your cart. Ready for a fresh start!",
          cartAction: { type: 'clear' }
        };
      }

      case 'summary': {
        if (currentCartItems.length === 0) {
          return { 
            text: "Your cart is empty. Total: $0.00",
            cartAction: { type: 'summary' }
          };
        }

        const total = currentCartItems.reduce((sum, item) => {
          return sum + (item.product?.price || 0) * item.quantity;
        }, 0);

        return {
          text: `Cart total: $${total.toFixed(2)} (${currentCartItems.length} item(s))`,
          cartAction: { type: 'summary' }
        };
      }

      default:
        return { text: "I didn't understand that cart command." };
    }
  }
}
