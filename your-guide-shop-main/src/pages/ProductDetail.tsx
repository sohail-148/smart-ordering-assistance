import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Star, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProduct(parseInt(id!));
        // Transform backend product to frontend format
        const transformedProduct: Product = {
          id: data.id.toString(),
          name: data.name,
          category: data.category as any,
          price: data.price,
          rating: 4.5, // Default rating since not stored in backend
          image: data.image_url || '/placeholder.svg',
          description: data.description,
          specs: {}, // Could be enhanced to parse specs from backend
          inStock: data.stock > 0,
        };
        setProduct(transformedProduct);
      } catch (error) {
        toast.error("Failed to load product");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  // Load cart from backend on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartData = await api.getCart();
        if (cartData && cartData.items && Array.isArray(cartData.items)) {
          // Transform backend cart items to frontend format
          const transformedCart: Product[] = cartData.items.map((item: any) => ({
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
          setCart(transformedCart);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    loadCart();
  }, []);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await api.addToCart(parseInt(product.id), quantity);
      
      // Add to local cart state for immediate UI update
      const newItems = Array(quantity).fill(product);
      setCart(prev => [...prev, ...newItems]);
      
      toast.success(`Added ${quantity} ${product.name}${quantity > 1 ? 's' : ''} to cart!`);
      setQuantity(1); // Reset quantity
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      // Find the cart item to remove
      const cartData = await api.getCart();
      const itemToRemove = cartData.items.find((item: any) => 
        item.product.id.toString() === productId
      );
      
      if (itemToRemove) {
        await api.removeFromCart(itemToRemove.id);
        setCart(prev => {
          const index = prev.findIndex(item => item.id === productId);
          if (index > -1) {
            const newCart = [...prev];
            newCart.splice(index, 1);
            return newCart;
          }
          return prev;
        });
        toast.success("Removed from cart");
      }
    } catch (error) {
      toast.error("Failed to remove from cart");
    }
  };

  const handleCheckout = async () => {
    try {
      await api.createOrder();
      setCart([]);
      setShowCheckout(false);
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Product Details</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cart.length}
                </Badge>
              )}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Product Details */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2 capitalize">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.rating})
                </span>
              </div>
              <p className="text-3xl font-bold text-primary mb-4">
                ${product.price.toFixed(2)}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.inStock && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
              </div>
            )}

            {!product.inStock && (
              <Button disabled className="w-full" size="lg">
                Out of Stock
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        items={cart}
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemove={handleRemoveFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setShowCheckout(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        items={cart}
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        onOrderComplete={handleCheckout}
      />
    </div>
  );
};

export default ProductDetail;