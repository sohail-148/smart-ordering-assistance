import { Product } from "@/lib/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Trash2, ShoppingBag } from "lucide-react";

interface CartDrawerProps {
  items: Product[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const CartDrawer = ({ items, open, onClose, onRemove, onCheckout }: CartDrawerProps) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-card border-border w-[360px]">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-3 flex-1">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Your cart is empty</p>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-sm font-bold text-primary">${item.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="mt-auto pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  disabled={items.length === 0}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
