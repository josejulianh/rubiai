import type { Express } from "express";
import { type Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerSecretaryRoutes } from "./replit_integrations/secretary/routes";
import { registerStripeRoutes } from "./stripeRoutes";
import { registerGamificationRoutes } from "./replit_integrations/gamification/routes";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { storage } from "./storage";
import { z } from "zod";

const updatePreferencesSchema = z.object({
  theme: z.enum(["auto", "light", "dark"]).optional(),
  avatarMood: z.string().optional(),
  favoriteTopics: z.array(z.string()).optional(),
  responseMode: z.enum(["expert", "casual", "balanced"]).optional(),
  communicationStyle: z.enum(["formal", "friendly", "playful"]).optional(),
  userContext: z.string().max(1000).optional().nullable(),
  lastMood: z.string().optional(),
  detectedEmotions: z.array(z.string()).optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerSecretaryRoutes(app);
  registerStripeRoutes(app);
  registerGamificationRoutes(app);
  registerAudioRoutes(app);

  app.get("/api/user/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences || { 
        theme: "auto", 
        avatarMood: "happy", 
        favoriteTopics: [], 
        totalInteractions: 0,
        responseMode: "balanced",
        communicationStyle: "friendly",
        userContext: null,
        lastMood: "neutral"
      });
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  app.put("/api/user/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = updatePreferencesSchema.parse(req.body);
      const preferences = await storage.updateUserPreferences(userId, validatedData);
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error updating preferences:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  app.get("/api/daily-tip", async (_req, res) => {
    try {
      const tip = await storage.getRandomDailyTip();
      res.json(tip);
    } catch (error) {
      console.error("Error fetching daily tip:", error);
      res.status(500).json({ error: "Failed to fetch daily tip" });
    }
  });

  return httpServer;
}
