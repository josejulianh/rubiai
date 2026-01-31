// Gamification Storage - Achievements, Points, Levels
import { db } from "../../db";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { 
  achievements, userAchievements, userStats, dailyChallenges,
  type Achievement, type UserAchievement, type UserStats, type DailyChallenge
} from "@shared/schema";

// Level thresholds
const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, // 1-10
  5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000 // 11-20
];

export function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getPointsForNextLevel(level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return LEVEL_THRESHOLDS[level];
}

class GamificationStorage {
  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements).orderBy(achievements.category);
  }

  async getAchievementByCode(code: string): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.code, code));
    return achievement;
  }

  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const results = await db
      .select()
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));
    
    return results.map(r => ({
      ...r.user_achievements,
      achievement: r.achievements
    }));
  }

  async getUnlockedAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const results = await db
      .select()
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(and(
        eq(userAchievements.userId, userId),
        sql`${userAchievements.unlockedAt} IS NOT NULL`
      ));
    
    return results.map(r => ({
      ...r.user_achievements,
      achievement: r.achievements
    }));
  }

  async updateAchievementProgress(userId: string, achievementCode: string, increment: number = 1): Promise<{ unlocked: boolean; achievement?: Achievement }> {
    const achievement = await this.getAchievementByCode(achievementCode);
    if (!achievement) return { unlocked: false };

    // Get or create user achievement
    let [userAch] = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievement.id)
      ));

    if (!userAch) {
      [userAch] = await db
        .insert(userAchievements)
        .values({ userId, achievementId: achievement.id, progress: 0 })
        .returning();
    }

    // Already unlocked
    if (userAch.unlockedAt) return { unlocked: false };

    const newProgress = (userAch.progress || 0) + increment;
    const requirement = achievement.requirement || 1;

    if (newProgress >= requirement) {
      // Unlock achievement
      await db
        .update(userAchievements)
        .set({ progress: newProgress, unlockedAt: new Date() })
        .where(eq(userAchievements.id, userAch.id));

      // Add points
      await this.addPoints(userId, achievement.points || 10);

      return { unlocked: true, achievement };
    } else {
      // Update progress
      await db
        .update(userAchievements)
        .set({ progress: newProgress })
        .where(eq(userAchievements.id, userAch.id));

      return { unlocked: false };
    }
  }

  // User Stats
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats;
  }

  async getOrCreateUserStats(userId: string): Promise<UserStats> {
    let stats = await this.getUserStats(userId);
    if (!stats) {
      [stats] = await db.insert(userStats).values({ userId }).returning();
    }
    return stats;
  }

  async addPoints(userId: string, points: number): Promise<UserStats> {
    const stats = await this.getOrCreateUserStats(userId);
    const newTotal = (stats.totalPoints || 0) + points;
    const newLevel = calculateLevel(newTotal);

    const [updated] = await db
      .update(userStats)
      .set({ 
        totalPoints: newTotal, 
        level: newLevel,
        updatedAt: new Date() 
      })
      .where(eq(userStats.userId, userId))
      .returning();

    return updated;
  }

  async incrementStat(userId: string, stat: 'totalMessages' | 'totalTasksCompleted' | 'gamesPlayed' | 'gamesWon' | 'triviaCorrect'): Promise<void> {
    const stats = await this.getOrCreateUserStats(userId);
    await db
      .update(userStats)
      .set({ 
        [stat]: (stats[stat] || 0) + 1,
        updatedAt: new Date() 
      })
      .where(eq(userStats.userId, userId));
  }

  async updateStreak(userId: string): Promise<{ currentStreak: number; isNewDay: boolean }> {
    const stats = await this.getOrCreateUserStats(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActive = stats.lastActiveDate ? new Date(stats.lastActiveDate) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    let newStreak = stats.currentStreak || 0;
    let isNewDay = false;

    if (!lastActive || lastActive.getTime() < today.getTime()) {
      isNewDay = true;
      
      // Check if consecutive day
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive && lastActive.getTime() === yesterday.getTime()) {
        newStreak += 1;
      } else if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
        newStreak = 1; // Reset streak
      }

      const longestStreak = Math.max(stats.longestStreak || 0, newStreak);

      await db
        .update(userStats)
        .set({ 
          currentStreak: newStreak,
          longestStreak,
          lastActiveDate: new Date(),
          updatedAt: new Date() 
        })
        .where(eq(userStats.userId, userId));
    }

    return { currentStreak: newStreak, isNewDay };
  }

  // Daily Challenges
  async getDailyChallenges(userId: string): Promise<DailyChallenge[]> {
    const now = new Date();
    return await db
      .select()
      .from(dailyChallenges)
      .where(and(
        eq(dailyChallenges.userId, userId),
        gte(dailyChallenges.expiresAt, now)
      ));
  }

  async createDailyChallenge(userId: string, type: string, target: number, bonus: number): Promise<DailyChallenge> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const [challenge] = await db
      .insert(dailyChallenges)
      .values({
        userId,
        challengeType: type,
        targetCount: target,
        bonusPoints: bonus,
        expiresAt: tomorrow,
      })
      .returning();

    return challenge;
  }

  async updateChallengeProgress(userId: string, type: string, increment: number = 1): Promise<DailyChallenge | null> {
    const challenges = await this.getDailyChallenges(userId);
    const challenge = challenges.find(c => c.challengeType === type && !c.isCompleted);
    
    if (!challenge) return null;

    const newCount = (challenge.currentCount || 0) + increment;
    const isCompleted = newCount >= challenge.targetCount;

    const [updated] = await db
      .update(dailyChallenges)
      .set({ 
        currentCount: newCount,
        isCompleted 
      })
      .where(eq(dailyChallenges.id, challenge.id))
      .returning();

    if (isCompleted) {
      await this.addPoints(userId, challenge.bonusPoints || 50);
    }

    return updated;
  }

  async generateDailyChallenges(userId: string): Promise<DailyChallenge[]> {
    // Clear expired challenges
    const now = new Date();
    await db
      .delete(dailyChallenges)
      .where(and(
        eq(dailyChallenges.userId, userId),
        sql`${dailyChallenges.expiresAt} < ${now}`
      ));

    // Check if already has challenges for today
    const existing = await this.getDailyChallenges(userId);
    if (existing.length > 0) return existing;

    // Generate new challenges
    const challengeTypes = [
      { type: 'send_messages', target: 5, bonus: 30 },
      { type: 'complete_task', target: 1, bonus: 50 },
      { type: 'play_game', target: 1, bonus: 40 },
    ];

    const challenges: DailyChallenge[] = [];
    for (const ct of challengeTypes) {
      const challenge = await this.createDailyChallenge(userId, ct.type, ct.target, ct.bonus);
      challenges.push(challenge);
    }

    return challenges;
  }

  // Leaderboard
  async getLeaderboard(limit: number = 10): Promise<UserStats[]> {
    return await db
      .select()
      .from(userStats)
      .orderBy(desc(userStats.totalPoints))
      .limit(limit);
  }
}

export const gamificationStorage = new GamificationStorage();
