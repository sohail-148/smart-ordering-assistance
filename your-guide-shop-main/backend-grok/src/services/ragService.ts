import { ProductModel } from '../models/Product';
import { ProductContext } from '../types';

export class RAGService {
  /**
   * Extract key terms from user message for product search
   */
  static extractKeyTerms(message: string): string[] {
    const normalized = message.toLowerCase();
    
    // Remove common stop words but keep important shopping terms
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                       'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
                       'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
                       'my', 'your', 'his', 'her', 'its', 'our', 'their'];
    
    let words = normalized.split(/\s+/).filter(word => 
      word.length > 2 && !stopWords.includes(word)
    );
    
    // Handle singular/plural variations for better search
    const expandedWords = [...words];
    words.forEach(word => {
      // Add plural form if singular
      if (!word.endsWith('s') && !word.endsWith('es')) {
        expandedWords.push(word + 's');
      }
      // Add singular form if plural
      if (word.endsWith('s') && word.length > 3) {
        expandedWords.push(word.slice(0, -1));
      }
      // Handle common variations
      if (word === 'headphone') expandedWords.push('headphones');
      if (word === 'headphones') expandedWords.push('headphone');
    });
    
    console.log('Extracted key terms:', expandedWords);
    return expandedWords;
  }

  /**
   * Retrieve relevant products based on user message
   */
  static async getProductContext(message: string): Promise<ProductContext> {
    const keyTerms = this.extractKeyTerms(message);
    const normalized = message.toLowerCase();
    
    // Check if this is a casual greeting or non-shopping query
    const casualPhrases = ['hi', 'hello', 'hey', 'thanks', 'thank you', 'okay', 'ok', 'yes', 'no', 'bye'];
    const isCasual = casualPhrases.some(phrase => normalized.trim() === phrase);
    
    // Check for off-topic questions (not related to shopping)
    const offTopicPatterns = [
      /\b(car|cars|vehicle|automobile)\b/,
      /\b(weather|temperature|climate)\b/,
      /\b(news|politics|government)\b/,
      /\b(sports|football|basketball|cricket)\b/,
      /\b(movie|film|cinema|tv show)\b/,
      /\b(restaurant|food delivery|pizza|burger)\b/,
      /\b(college|university|school|education)\b/,
      /\b(programming|code|python|javascript)\b/,
      /\b(job|career|hiring|employment)\b/,
      /\b(health|medical|doctor|hospital)\b/,
    ];
    
    const isOffTopic = offTopicPatterns.some(pattern => pattern.test(normalized));
    
    // Don't search for products on casual greetings or off-topic questions
    if (isCasual || isOffTopic) {
      return {
        products: [],
        contextString: isOffTopic 
          ? 'User asked an off-topic question not related to shopping. Politely redirect them to shopping-related queries.'
          : 'User sent a casual message. Respond naturally without forcing product recommendations.',
      };
    }
    
    // Always try to search for actual product queries
    let products: any[] = [];
    
    // Extract price range if mentioned
    const priceMatch = normalized.match(/under\s+\$?(\d+)|below\s+\$?(\d+)|less\s+than\s+\$?(\d+)/);
    const maxPrice = priceMatch ? parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]) : undefined;
    
    // Check if message is asking for specific categories
    const categories = ['electronics', 'clothing', 'toys', 'lifestyle'];
    const matchedCategories = categories.filter(cat => normalized.includes(cat));
    
    // Check for "all categories" request
    const showAll = normalized.includes('all categories') || normalized.includes('all category');
    
    if (showAll) {
      // Show products from all categories
      console.log('Showing products from all categories');
      products = ProductModel.findAll({});
      console.log('Found products from all categories:', products.length);
      
      // Limit to 8 products, mix from different categories
      const productsByCategory: { [key: string]: any[] } = {};
      products.forEach(p => {
        if (!productsByCategory[p.category]) productsByCategory[p.category] = [];
        productsByCategory[p.category].push(p);
      });
      
      // Take 2 from each category
      products = [];
      Object.values(productsByCategory).forEach(catProducts => {
        products.push(...catProducts.slice(0, 2));
      });
      
      products = products.slice(0, 8);
    } else if (matchedCategories.length > 0) {
      // Search by categories (can be multiple)
      console.log('Searching by categories:', matchedCategories);
      
      for (const category of matchedCategories) {
        const categoryProducts = ProductModel.findAll({ 
          category,
          maxPrice 
        });
        products.push(...categoryProducts);
      }
      
      console.log('Found products by categories:', products.length);
      
      // Limit to 8 products total (more for multiple categories)
      products = products.slice(0, 8);
    } else if (keyTerms.length === 0) {
      // If no key terms and not casual, check if it's a simple product request
      const simpleProductRequests = ['show', 'display', 'list', 'find', 'get', 'see'];
      const hasSimpleRequest = simpleProductRequests.some(req => normalized.includes(req));
      
      if (hasSimpleRequest) {
        // Try to extract product names from the message directly
        const productKeywords = ['headphone', 'headphones', 'tablet', 'camera', 'watch', 'smartwatch', 
                                'laptop', 'phone', 'speaker', 'mouse', 'keyboard', 'jacket', 'shoes', 
                                'sneakers', 'backpack', 'bottle', 'coffee', 'lamp'];
        
        const foundKeywords = productKeywords.filter(keyword => normalized.includes(keyword));
        
        if (foundKeywords.length > 0) {
          console.log('Found product keywords in simple request:', foundKeywords);
          const searchQuery = foundKeywords.join(' ');
          products = ProductModel.searchForRAG(searchQuery, 8);
          console.log('Found products with direct keyword search:', products.length);
        }
      }
      
      if (products.length === 0) {
        return {
          products: [],
          contextString: 'No specific product query detected. Respond naturally and ask what they are looking for.',
        };
      }
    } else {
      // Search for products using key terms
      const searchQuery = keyTerms.join(' ');
      console.log('Searching with query:', searchQuery, 'maxPrice:', maxPrice);
      
      // Add specific product aliases for better matching
      const aliases: { [key: string]: string[] } = {
        'headphone': ['aurasound'],
        'headphones': ['aurasound'],
        'aurasound': ['headphones', 'headphone'],
        'tablet': ['novapad'],
        'novapad': ['tablet'],
        'camera': ['pixellens'],
        'pixellens': ['camera'],
        'smartwatch': ['ultrafit'],
        'ultrafit': ['smartwatch'],
        'watch': ['ultrafit'],
      };
      
      // Expand search terms with aliases (more conservative)
      let expandedTerms = [...keyTerms];
      keyTerms.forEach(term => {
        if (aliases[term.toLowerCase()]) {
          expandedTerms.push(...aliases[term.toLowerCase()]);
        }
      });
      
      const expandedQuery = expandedTerms.join(' ');
      console.log('Expanded search query:', expandedQuery);
      
      products = ProductModel.searchForRAG(expandedQuery, 8);
      
      // If no products found with expanded query, try with original terms
      if (products.length === 0 && expandedQuery !== searchQuery) {
        console.log('No results with expanded query, trying original query:', searchQuery);
        products = ProductModel.searchForRAG(searchQuery, 8);
      }
      
      // If still no products found, try individual key terms
      if (products.length === 0 && keyTerms.length > 0) {
        console.log('No results with combined query, trying individual terms');
        for (const term of keyTerms) {
          const termProducts = ProductModel.searchForRAG(term, 8);
          products.push(...termProducts);
          if (products.length >= 8) break;
        }
        // Remove duplicates
        const seen = new Set();
        products = products.filter(p => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
      }
      
      // Apply price filter if specified
      if (maxPrice) {
        products = products.filter(p => p.price <= maxPrice);
      }
      
      console.log('Found products:', products.length);
    }
    
    // Build context string
    let contextString = '';
    
    if (products.length > 0) {
      contextString = 'Here are relevant products from our catalog:\n\n';
      products.forEach((product, index) => {
        contextString += `${index + 1}. ${product.name}\n`;
        contextString += `   Price: $${product.price.toFixed(2)}\n`;
        contextString += `   Category: ${product.category}\n`;
        contextString += `   Description: ${product.description}\n`;
        contextString += `   Stock: ${product.stock > 0 ? 'In stock' : 'Out of stock'}\n\n`;
      });
      
      console.log('Final product context built with', products.length, 'products');
    } else {
      contextString = 'No products found matching your query. You can browse our catalog or ask about different products.';
      console.log('No products found for query:', message);
    }
    
    return {
      products,
      contextString,
    };
  }

  /**
   * Build system prompt for Grok API
   */
  static buildSystemPrompt(): string {
    return `You are a helpful shopping assistant for an e-commerce store. Your role is to:
- Help customers find products they're looking for
- Provide product recommendations based on their needs
- Answer questions about products, pricing, and availability
- Be friendly, concise, and helpful

CRITICAL RULES:
1. ONLY recommend products when they are explicitly listed in the Product Context below
2. NEVER make up or hallucinate product names, prices, or details
3. If the Product Context says "casual message" or "no specific product query", respond naturally WITHOUT listing products
4. For greetings like "hi", "hello", "hey" - just greet back and ask how you can help (don't list products)
5. Always use the EXACT product names and prices from the context when products ARE provided
6. When products are provided in context, ALWAYS mention them in your response - don't ignore available products
7. If someone asks to "show" or "see" a product and it's in the context, ALWAYS display it

PRODUCT DISPLAY RULES:
- When products are available in context, show them even if the user's request seems simple
- If user asks "show me headphones" and headphones are in context, display them
- If user asks "headphone" and headphones are in context, display them
- Don't say "no products found" if products are actually provided in the context

HANDLING OFF-TOPIC QUESTIONS:
- If the Product Context says "off-topic question", the user is asking about something NOT related to shopping
- For off-topic questions (cars, weather, programming, colleges, sports, movies, etc.), respond with:
  "I'm a shopping assistant and can only help with products in our store. I can assist with finding electronics, clothing, toys, or lifestyle products. What are you looking for today?"
- DO NOT try to answer off-topic questions
- DO NOT list products when handling off-topic questions
- Keep the redirect polite and brief

Keep responses under 2-3 sentences for casual messages and redirects.
When showing products, keep responses to 3-4 sentences.
If a product is out of stock, mention it and suggest alternatives.`;
  }
}
