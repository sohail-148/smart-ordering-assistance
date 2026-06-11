import { ChatMessage as ChatMessageType, Product } from "@/lib/types";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ProductCard from "./ProductCard";

interface ChatMessageProps {
  message: ChatMessageType;
  onCompare?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const ChatMessage = ({ message, onCompare, onAddToCart }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-surface-user text-primary-foreground rounded-br-md"
              : "bg-surface-assistant text-foreground rounded-bl-md"
          }`}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {message.products && message.products.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin max-w-full">
            {message.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                compact
                onCompare={onCompare}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}

        <span className="text-[10px] text-muted-foreground px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
