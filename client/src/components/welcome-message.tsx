import { motion } from "framer-motion";
import { RubiAvatar } from "@/components/rubi-avatar";
import { Button } from "@/components/ui/button";
import { Sparkles, Code, Lightbulb, Pencil } from "lucide-react";
import type { User } from "@shared/models/auth";

interface WelcomeMessageProps {
  user: User | null;
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  { icon: Lightbulb, text: "Give me a creative idea for a weekend project", color: "text-yellow-500" },
  { icon: Code, text: "Explain how async/await works in JavaScript", color: "text-blue-500" },
  { icon: Pencil, text: "Help me write a professional email", color: "text-pink-500" },
  { icon: Sparkles, text: "Surprise me with an interesting fact", color: "text-purple-500" },
];

export function WelcomeMessage({ user, onSuggestionClick }: WelcomeMessageProps) {
  const firstName = user?.firstName || user?.email?.split("@")[0] || "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full p-8 text-center"
    >
      <RubiAvatar size="lg" mood="excited" className="mb-6" />
      
      <h2 className="text-2xl md:text-3xl font-bold mb-3">
        Hello, <span className="gradient-text">{firstName}</span>!
      </h2>
      
      <p className="text-muted-foreground mb-8 max-w-md">
        I'm Rubi, your AI assistant. I'm here to help you with anything - from creative ideas to technical questions. What would you like to explore today?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto p-4 justify-start gap-3 text-left hover-elevate group"
              onClick={() => onSuggestionClick(suggestion.text)}
              data-testid={`button-suggestion-${index}`}
            >
              <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <suggestion.icon className={`w-4 h-4 ${suggestion.color}`} />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                {suggestion.text}
              </span>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
