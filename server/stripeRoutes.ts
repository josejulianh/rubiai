// Stripe Routes for Rubi Premium Subscription
import type { Express, Response } from "express";
import { isAuthenticated } from "./replit_integrations/auth";
import { stripeService } from "./stripeService";
import { storage } from "./storage";
import { getStripePublishableKey } from "./stripeClient";
import { z } from "zod";

const customizationSchema = z.object({
  customRubiName: z.string().max(50).optional().nullable(),
  customRubiPersonality: z.string().max(500).optional().nullable(),
  customRubiTone: z.enum(["friendly", "professional", "playful", "motivational", "sarcastic", "serious"]).optional().nullable(),
  customRubiColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
});

// Helper function to get base URL
function getBaseUrl(): string {
  return process.env.RENDER_EXTERNAL_URL 
    || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : null)
    || `https://${process.env.RENDER_SERVICE_NAME || 'localhost'}.onrender.com`;
}

export function registerStripeRoutes(app: Express) {
  // Get Stripe publishable key for frontend
  app.get("/api/stripe/config", async (req, res: Response) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting Stripe config:", error);
      res.status(500).json({ error: "Failed to get Stripe config" });
    }
  });

  // Get available products and prices
  app.get("/api/stripe/products", async (req, res: Response) => {
    try {
      const rows = await stripeService.listProductsWithPrices();
      
      // Group prices by product
      const productsMap = new Map();
      for (const row of rows as any[]) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            active: row.product_active,
            metadata: row.product_metadata,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            active: row.price_active,
          });
        }
      }
      
      res.json({ data: Array.from(productsMap.values()) });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get user subscription status
  app.get("/api/stripe/subscription", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const prefs = await storage.getUserPreferences(userId);
      
      if (!prefs || !prefs.stripeSubscriptionId) {
        return res.json({ subscription: null, isPremium: false });
      }
      
      const subscription = await stripeService.getSubscription(prefs.stripeSubscriptionId);
      res.json({ 
        subscription,
        isPremium: prefs.isPremium,
        customization: {
          customRubiName: prefs.customRubiName,
          customRubiPersonality: prefs.customRubiPersonality,
          customRubiTone: prefs.customRubiTone,
          customRubiColor: prefs.customRubiColor,
        }
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // Create checkout session for subscription
  app.post("/api/stripe/checkout", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const email = req.user.claims.email;
      const { priceId } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
      }
      
      let prefs = await storage.getUserPreferences(userId);
      let customerId = prefs?.stripeCustomerId;
      
      // Create Stripe customer if not exists
      if (!customerId) {
        const customer = await stripeService.createCustomer(email, userId);
        customerId = customer.id;
        await storage.updateUserPreferences(userId, { stripeCustomerId: customerId });
      }
      
      // Create checkout session
      const baseUrl = getBaseUrl();
      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${baseUrl}/?checkout=success`,
        `${baseUrl}/?checkout=cancelled`
      );
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Create customer portal session for managing subscription
  app.post("/api/stripe/portal", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const prefs = await storage.getUserPreferences(userId);
      
      if (!prefs?.stripeCustomerId) {
        return res.status(400).json({ error: "No subscription found" });
      }
      
      const baseUrl = getBaseUrl();
      const session = await stripeService.createCustomerPortalSession(
        prefs.stripeCustomerId,
        baseUrl
      );
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating portal session:", error);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  // Update premium customization settings
  app.put("/api/stripe/customization", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const prefs = await storage.getUserPreferences(userId);
      
      if (!prefs?.isPremium) {
        return res.status(403).json({ error: "Premium subscription required" });
      }
      
      // Validate request body
      const validatedData = customizationSchema.parse(req.body);
      
      await storage.updateUserPreferences(userId, {
        customRubiName: validatedData.customRubiName,
        customRubiPersonality: validatedData.customRubiPersonality,
        customRubiTone: validatedData.customRubiTone,
        customRubiColor: validatedData.customRubiColor,
      });
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid customization data", details: error.errors });
      }
      console.error("Error updating customization:", error);
      res.status(500).json({ error: "Failed to update customization" });
    }
  });
}