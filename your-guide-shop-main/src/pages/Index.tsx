import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChatMessage as ChatMessageType, Product, Category } from "@/lib/types";
import { api } from "@/lib/api";
import { ShoppingBag, GitCompareArrows, LogOut } from "lucide-react";
import { toast } from "sonner";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import WelcomeScreen from "@/components/WelcomeScreen";
import ComparisonModal from "@/components/ComparisonModal";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    // Load messages from sessionStorage on mount
    const saved = sessionStorage.getItem('chatMessages');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return [];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Load cart from backend on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartData = await api.getCart();
        if (cartData && cartData.items && Array.isArray(cartData.items)) {
          const cartProducts = cartData.items.map((item: any) => ({
            id: item.product.id.toString(),
            name: item.product.name,
            category: item.product.category,
            price: item.product.price,
            rating: 4.5,
            image: item.product.image_url || '/placeholder.svg',
            description: item.product.description,
            specs: {},
            inStock: item.product.stock > 0,
          }));
          setCart(cartProducts);
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };
    loadCart();
  }, []);

  const handleLogout = () => {
    api.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await api.sendMessage(text);
      
      // Handle cart actions from backend
      if (response.cartAction) {
        const { type } = response.cartAction;
        
        try {
          switch (type) {
            case 'add':
            case 'remove':
              // Refresh cart from backend
              const cartData = await api.getCart();
              if (cartData && cartData.items && Array.isArray(cartData.items)) {
                const cartProducts = cartData.items.map((item: any) => ({
                  id: item.product.id.toString(),
                  name: item.product.name,
                  category: item.product.category,
                  price: item.product.price,
                  rating: 4.5,
                  image: item.product.image_url || '/placeholder.svg',
                  description: item.product.description,
                  specs: {},
                  inStock: item.product.stock > 0,
                }));
                setCart(cartProducts);
              } else {
                setCart([]);
              }
              break;
            case 'view':
              setShowCart(true);
              break;
            case 'clear':
              setCart([]);
              break;
          }
        } catch (cartError) {
          console.error('Cart action error:', cartError);
        }
      }
      
      const assistantMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.message,
        products: response.products,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCategoryChange = (cat: Category) => {
    setSelectedCategory(cat);
    const label = cat === "all" ? "all categories" : cat;
    handleSend(`Show me products in ${label}`);
  };

  const handleCompare = (product: Product) => {
    setCompareList((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        toast.info(`${product.name} removed from comparison`);
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 2) {
        toast.info("Showing comparison!");
        const next = [prev[1], product];
        setShowComparison(true);
        return next;
      }
      toast.success(`${product.name} added to comparison (${prev.length + 1}/2)`);
      if (prev.length === 1) {
        setTimeout(() => setShowComparison(true), 300);
      }
      return [...prev, product];
    });
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await api.addToCart(parseInt(product.id), 1);
      // Refresh cart from backend
      const cartData = await api.getCart();
      const cartProducts = cartData.items.map((item: any) => ({
        id: item.product.id.toString(),
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        rating: 4.5,
        image: item.product.image_url || '/placeholder.svg',
        description: item.product.description,
        specs: {},
        inStock: item.product.stock > 0,
      }));
      setCart(cartProducts);
      toast.success(`${product.name} added to cart!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleRemoveFromCart = async (id: string) => {
    console.log('Removing item with id:', id);
    try {
      // Find the cart item by product id
      const cartData = await api.getCart();
      console.log('Current cart data:', cartData);
      const itemToRemove = cartData.items.find((item: any) => item.product.id.toString() === id);
      console.log('Item to remove:', itemToRemove);
      
      if (itemToRemove) {
        await api.removeFromCart(itemToRemove.id);
        console.log('Item removed, refreshing cart...');
        // Refresh cart from backend
        const updatedCart = await api.getCart();
        console.log('Updated cart:', updatedCart);
        if (updatedCart && updatedCart.items && Array.isArray(updatedCart.items)) {
          const cartProducts = updatedCart.items.map((item: any) => ({
            id: item.product.id.toString(),
            name: item.product.name,
            category: item.product.category,
            price: item.product.price,
            rating: 4.5,
            image: item.product.image_url || '/placeholder.svg',
            description: item.product.description,
            specs: {},
            inStock: item.product.stock > 0,
          }));
          console.log('Setting cart to:', cartProducts);
          setCart(cartProducts);
        } else {
          console.log('Cart is empty, setting to []');
          setCart([]);
        }
        toast.success('Item removed from cart');
      }
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      toast.error(error.message || 'Failed to remove from cart');
    }
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleOrderComplete = async () => {
    try {
      await api.clearCart();
      setCart([]);
      toast.success("Order placed successfully! 🎉");
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      // Still clear the frontend cart even if backend fails
      setCart([]);
      toast.success("Order placed successfully! 🎉");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-primary text-lg">🛒</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">ShopAI Assistant</h1>
            <p className="text-[10px] text-muted-foreground">Powered by RAG</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {compareList.length > 0 && (
            <button
              onClick={() => setShowComparison(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              Compare ({compareList.length})
            </button>
          )}
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      {messages.length === 0 ? (
        <WelcomeScreen onPromptClick={handleSend} />
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onCompare={handleCompare}
              onAddToCart={handleAddToCart}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 p-4 md:p-6 border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={handleSend}
            disabled={isTyping}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>

      {/* Modals */}
      <ComparisonModal
        products={compareList}
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
      <CartDrawer
        key={cart.length}
        items={cart}
        open={showCart}
        onClose={() => setShowCart(false)}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
      <CheckoutModal
        items={cart}
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
};

export default Index;
