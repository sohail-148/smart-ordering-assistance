import { motion } from "framer-motion";
import { Bot, Sparkles, ArrowRight } from "lucide-react";
import { suggestedPrompts } from "@/lib/mock-data";

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

const WelcomeScreen = ({ onPromptClick }: WelcomeScreenProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full space-y-8 text-center"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
            style={{ boxShadow: "var(--glow-primary)" }}
          >
            <Bot className="w-8 h-8 text-primary" />
          </motion.div>

          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Shopping <span className="text-primary">Assistant</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Discover, compare, and shop across electronics, clothing, toys, and lifestyle products with AI-powered recommendations.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Try asking</span>
          </div>
          <div className="grid gap-2">
            {suggestedPrompts.slice(0, 4).map((prompt, i) => (
              <motion.button
                key={prompt}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                onClick={() => onPromptClick(prompt)}
                className="group flex items-center justify-between text-left w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 hover:bg-secondary transition-all text-sm text-secondary-foreground"
              >
                <span>{prompt}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
