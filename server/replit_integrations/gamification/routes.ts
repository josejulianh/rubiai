// Gamification Routes
import type { Express, Response } from "express";
import { isAuthenticated } from "../auth";
import { gamificationStorage, calculateLevel, getPointsForNextLevel } from "./storage";

export function registerGamificationRoutes(app: Express) {
  // Get user stats with level info
  app.get("/api/gamification/stats", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await gamificationStorage.getOrCreateUserStats(userId);
      
      const level = stats.level || 1;
      const currentPoints = stats.totalPoints || 0;
      const pointsForCurrent = level > 1 ? getPointsForNextLevel(level - 1) : 0;
      const pointsForNext = getPointsForNextLevel(level);
      const progressPercent = Math.min(100, ((currentPoints - pointsForCurrent) / (pointsForNext - pointsForCurrent)) * 100);

      res.json({
        ...stats,
        levelProgress: {
          current: level,
          pointsInLevel: currentPoints - pointsForCurrent,
          pointsNeeded: pointsForNext - pointsForCurrent,
          progressPercent: Math.round(progressPercent),
        }
      });
    } catch (error) {
      console.error("Error getting stats:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // Get all achievements with user progress
  app.get("/api/gamification/achievements", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const allAchievements = await gamificationStorage.getAchievements();
      const userAchievements = await gamificationStorage.getUserAchievements(userId);

      const achievementsWithProgress = allAchievements.map(ach => {
        const userAch = userAchievements.find(ua => ua.achievementId === ach.id);
        return {
          ...ach,
          progress: userAch?.progress || 0,
          unlockedAt: userAch?.unlockedAt || null,
          isUnlocked: !!userAch?.unlockedAt,
        };
      });

      res.json(achievementsWithProgress);
    } catch (error) {
      console.error("Error getting achievements:", error);
      res.status(500).json({ error: "Failed to get achievements" });
    }
  });

  // Get unlocked achievements only
  app.get("/api/gamification/achievements/unlocked", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const unlocked = await gamificationStorage.getUnlockedAchievements(userId);
      res.json(unlocked);
    } catch (error) {
      console.error("Error getting unlocked achievements:", error);
      res.status(500).json({ error: "Failed to get achievements" });
    }
  });

  // Get daily challenges
  app.get("/api/gamification/challenges", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const challenges = await gamificationStorage.generateDailyChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error("Error getting challenges:", error);
      res.status(500).json({ error: "Failed to get challenges" });
    }
  });

  // Get leaderboard
  app.get("/api/gamification/leaderboard", isAuthenticated, async (req: any, res: Response) => {
    try {
      const leaderboard = await gamificationStorage.getLeaderboard(20);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // Update streak (called on login/activity)
  app.post("/api/gamification/streak", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const result = await gamificationStorage.updateStreak(userId);
      
      // Check streak achievements
      if (result.isNewDay) {
        await gamificationStorage.updateAchievementProgress(userId, "streak_3", result.currentStreak >= 3 ? 1 : 0);
        await gamificationStorage.updateAchievementProgress(userId, "streak_7", result.currentStreak >= 7 ? 1 : 0);
        await gamificationStorage.updateAchievementProgress(userId, "streak_30", result.currentStreak >= 30 ? 1 : 0);
      }

      res.json(result);
    } catch (error) {
      console.error("Error updating streak:", error);
      res.status(500).json({ error: "Failed to update streak" });
    }
  });
}
