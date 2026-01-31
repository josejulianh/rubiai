import { userPreferences, dailyTips, type UserPreferences, type InsertUserPreferences, type DailyTip } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: string, data: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  getRandomDailyTip(): Promise<DailyTip | null>;
  incrementInteractions(userId: string): Promise<void>;
  findUserByStripeCustomerId(stripeCustomerId: string): Promise<UserPreferences | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async updateUserPreferences(userId: string, data: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userPreferences)
        .values({ userId, ...data })
        .returning();
      return created;
    }
  }

  async getRandomDailyTip(): Promise<DailyTip | null> {
    const [tip] = await db
      .select()
      .from(dailyTips)
      .where(eq(dailyTips.isActive, true))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return tip || null;
  }

  async incrementInteractions(userId: string): Promise<void> {
    const existing = await this.getUserPreferences(userId);
    if (existing) {
      await db
        .update(userPreferences)
        .set({ 
          totalInteractions: (existing.totalInteractions || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(userPreferences.userId, userId));
    } else {
      await db
        .insert(userPreferences)
        .values({ userId, totalInteractions: 1 });
    }
  }

  async findUserByStripeCustomerId(stripeCustomerId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.stripeCustomerId, stripeCustomerId));
    return prefs;
  }
}

export const storage = new DatabaseStorage();
