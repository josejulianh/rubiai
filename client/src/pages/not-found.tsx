import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RubiAvatar } from "@/components/rubi-avatar";
import { Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <RubiAvatar size="lg" mood="surprised" className="mx-auto mb-6" />
        
        <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Oops! It looks like you've wandered into uncharted territory. 
          Let me help you find your way back.
        </p>
        
        <Button asChild className="glow-primary" data-testid="button-go-home">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
