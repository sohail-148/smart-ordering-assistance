import { Product } from "@/lib/types";
import { Star, ShoppingCart, GitCompareArrows } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  onCompare?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  compact?: boolean;
}

const ProductCard = ({ product, onCompare, onAddToCart, compact }: ProductCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompare) onCompare(product);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleCardClick}
      className="group bg-surface-product border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-all duration-300 flex-shrink-0 cursor-pointer"
      style={{ width: compact ? 220 : 260 }}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
          <Star className="w-3 h-3 fill-primary text-primary" />
          <span className="text-xs font-medium text-foreground">{product.rating}</span>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-primary font-medium">
            {product.category}
          </span>
          <h3 className="text-sm font-semibold text-foreground leading-tight mt-0.5 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
          <div className="flex gap-1">
            {onCompare && (
              <button
                onClick={handleCompareClick}
                className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                title="Compare"
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
              </button>
            )}
            {onAddToCart && product.inStock && (
              <button
                onClick={handleAddToCartClick}
                className="p-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                title="Add to cart"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
