import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { Category } from "@/lib/types";

const categories: { value: Category; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "✨" },
  { value: "electronics", label: "Electronics", emoji: "🔌" },
  { value: "clothing", label: "Clothing", emoji: "👕" },
  { value: "toys", label: "Toys", emoji: "🧸" },
  { value: "lifestyle", label: "Lifestyle", emoji: "🏡" },
];

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  selectedCategory: Category;
  onCategoryChange: (cat: Category) => void;
}

const ChatInput = ({ onSend, disabled, selectedCategory, onCategoryChange }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2 bg-surface-chat border border-border rounded-xl p-2 focus-within:border-primary/50 transition-colors">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about products, comparisons, or recommendations..."
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none outline-none min-h-[40px] max-h-[120px] py-2 px-2"
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="flex-shrink-0 p-2.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatInput;
