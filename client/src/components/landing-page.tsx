import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RubiAvatar } from "@/components/rubi-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles, Brain, MessageCircle, Zap, Shield, Heart } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <RubiAvatar size="sm" mood="happy" />
              <span className="text-xl font-bold gradient-text">Rubi</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">
                Features
              </a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">
                About
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button asChild data-testid="button-login">
                <a href="/api/login">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 gradient-bg" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                >
                  <Sparkles className="w-4 h-4" />
                  Powered by Mistral AI
                </motion.div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Meet <span className="gradient-text">Rubi</span>,
                  <br />
                  Your AI Companion
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                  Experience the future of AI conversation. Rubi is intelligent, creative, and adapts to you. 
                  Your personal assistant that truly understands.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="glow-primary" asChild data-testid="button-hero-start">
                    <a href="/api/login">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Chatting
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                    <a href="#features">Learn More</a>
                  </Button>
                </div>

                <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Secure & Private
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Lightning Fast
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-3xl blur-2xl" />
                  <Card className="relative p-8 gradient-border bg-card/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-6">
                      <RubiAvatar size="xl" mood="excited" />
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">Hello there!</h3>
                        <p className="text-muted-foreground">I'm Rubi, ready to help you with anything.</p>
                      </div>
                      <div className="w-full p-4 rounded-xl bg-muted/50 border border-border/50">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Ask me anything...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose <span className="gradient-text">Rubi</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover what makes Rubi unique among AI assistants
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "Adaptive Intelligence",
                  description: "Rubi learns from your conversations and adapts to your communication style.",
                  color: "text-purple-500",
                },
                {
                  icon: Heart,
                  title: "Empathetic Responses",
                  description: "Experience conversations that feel natural, warm, and genuinely helpful.",
                  color: "text-pink-500",
                },
                {
                  icon: Sparkles,
                  title: "Creative Solutions",
                  description: "Get innovative ideas and creative suggestions for any challenge.",
                  color: "text-yellow-500",
                },
                {
                  icon: MessageCircle,
                  title: "Natural Conversations",
                  description: "Chat like you would with a friend - no rigid commands needed.",
                  color: "text-blue-500",
                },
                {
                  icon: Zap,
                  title: "Instant Responses",
                  description: "Real-time streaming responses for a fluid conversation experience.",
                  color: "text-orange-500",
                },
                {
                  icon: Shield,
                  title: "Privacy First",
                  description: "Your conversations are secure and your data is protected.",
                  color: "text-green-500",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="p-6 h-full hover-elevate transition-all duration-300 bg-card/50 backdrop-blur-sm">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-20 md:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <RubiAvatar size="lg" mood="calm" className="mx-auto mb-8" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who have discovered a new way to interact with AI. 
                Rubi is waiting to meet you.
              </p>
              <Button size="lg" className="glow-primary" asChild data-testid="button-cta-start">
                <a href="/api/login">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </a>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <RubiAvatar size="sm" mood="happy" />
              <span className="font-semibold">Rubi</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by Mistral AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
