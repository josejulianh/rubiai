import { motion } from "framer-motion";
import { Lightbulb, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

const tips = [
  { content: "You can use Shift+Enter to add a new line in your message.", category: "tip" },
  { content: "Rubi adapts to your conversation style over time.", category: "feature" },
  { content: "Try asking Rubi for creative ideas or brainstorming help!", category: "tip" },
  { content: "Dark mode activates automatically after 6 PM.", category: "feature" },
  { content: "Fun fact: Octopuses have three hearts!", category: "curiosity" },
  { content: "Rubi can help you with writing, coding, and creative projects.", category: "tip" },
  { content: "Did you know? Honey never spoils.", category: "curiosity" },
  { content: "Ask Rubi to explain complex topics in simple terms.", category: "tip" },
];

interface DailyTipProps {
  onClose?: () => void;
}

export function DailyTip({ onClose }: DailyTipProps) {
  const [tip, setTip] = useState(tips[0]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setTip(randomTip);
  }, []);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="w-full"
    >
      <Card className="relative overflow-hidden gradient-border">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5" />
        <div className="relative p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
              {tip.category === "curiosity" ? (
                <Sparkles className="w-5 h-5 text-accent" />
              ) : (
                <Lightbulb className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {tip.category === "curiosity" ? "Did You Know?" : tip.category === "feature" ? "Feature Spotlight" : "Daily Tip"}
              </p>
              <p className="text-sm">{tip.content}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 w-6 h-6"
              onClick={handleClose}
              data-testid="button-close-tip"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
