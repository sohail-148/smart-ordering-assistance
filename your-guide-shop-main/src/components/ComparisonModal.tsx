import { Product } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Check, X } from "lucide-react";

interface ComparisonModalProps {
  products: Product[];
  open: boolean;
  onClose: () => void;
}

const ComparisonModal = ({ products, open, onClose }: ComparisonModalProps) => {
  if (products.length < 2) return null;

  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specs)))
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Product Comparison</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 text-muted-foreground font-medium">Feature</th>
                {products.map((p) => (
                  <th key={p.id} className="text-left py-3 px-3 min-w-[160px]">
                    <div className="space-y-1">
                      <img src={p.image} alt={p.name} className="w-full h-20 object-cover rounded-md" />
                      <p className="font-semibold text-foreground text-xs">{p.name}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 text-muted-foreground">Price</td>
                {products.map((p) => (
                  <td key={p.id} className="py-2 px-3 font-bold text-primary">${p.price.toFixed(2)}</td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 text-muted-foreground">Rating</td>
                {products.map((p) => (
                  <td key={p.id} className="py-2 px-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      {p.rating}
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 text-muted-foreground">In Stock</td>
                {products.map((p) => (
                  <td key={p.id} className="py-2 px-3">
                    {p.inStock ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <X className="w-4 h-4 text-destructive" />
                    )}
                  </td>
                ))}
              </tr>
              {allSpecKeys.map((key) => (
                <tr key={key} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-muted-foreground">{key}</td>
                  {products.map((p) => (
                    <td key={p.id} className="py-2 px-3 text-foreground">
                      {p.specs[key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonModal;
