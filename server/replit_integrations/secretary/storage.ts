import { db } from "../../db";
import { tasks, calendarEvents, attachments, type Task, type InsertTask, type CalendarEvent, type InsertCalendarEvent, type Attachment, type InsertAttachment } from "@shared/schema";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

export class SecretaryStorage {
  // Task Management
  async getTasks(userId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async getTasksByStatus(userId: string, status: string): Promise<Task[]> {
    return db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.status, status))).orderBy(asc(tasks.dueDate));
  }

  async getUpcomingTasks(userId: string, days: number = 7): Promise<Task[]> {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return db.select().from(tasks).where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, "pending"),
        gte(tasks.dueDate, now),
        lte(tasks.dueDate, future)
      )
    ).orderBy(asc(tasks.dueDate));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(data: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(data).returning();
    return task;
  }

  async updateTask(id: number, data: Partial<InsertTask>): Promise<Task> {
    const [task] = await db.update(tasks).set({ ...data, updatedAt: new Date() }).where(eq(tasks.id, id)).returning();
    return task;
  }

  async completeTask(id: number): Promise<Task> {
    const [task] = await db.update(tasks).set({ 
      status: "completed", 
      completedAt: new Date(),
      updatedAt: new Date()
    }).where(eq(tasks.id, id)).returning();
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Calendar Events
  async getEvents(userId: string): Promise<CalendarEvent[]> {
    return db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId)).orderBy(asc(calendarEvents.startTime));
  }

  async getEventsByDateRange(userId: string, start: Date, end: Date): Promise<CalendarEvent[]> {
    return db.select().from(calendarEvents).where(
      and(
        eq(calendarEvents.userId, userId),
        gte(calendarEvents.startTime, start),
        lte(calendarEvents.endTime, end)
      )
    ).orderBy(asc(calendarEvents.startTime));
  }

  async getEvent(id: number): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
    return event;
  }

  async createEvent(data: InsertCalendarEvent): Promise<CalendarEvent> {
    const [event] = await db.insert(calendarEvents).values(data).returning();
    return event;
  }

  async updateEvent(id: number, data: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [event] = await db.update(calendarEvents).set({ ...data, updatedAt: new Date() }).where(eq(calendarEvents.id, id)).returning();
    return event;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // Attachments
  async getAttachments(userId: string): Promise<Attachment[]> {
    return db.select().from(attachments).where(eq(attachments.userId, userId)).orderBy(desc(attachments.createdAt));
  }

  async getAttachmentsByConversation(conversationId: number): Promise<Attachment[]> {
    return db.select().from(attachments).where(eq(attachments.conversationId, conversationId));
  }

  async getAttachment(id: number): Promise<Attachment | undefined> {
    const [attachment] = await db.select().from(attachments).where(eq(attachments.id, id));
    return attachment;
  }

  async createAttachment(data: InsertAttachment): Promise<Attachment> {
    const [attachment] = await db.insert(attachments).values(data).returning();
    return attachment;
  }

  async deleteAttachment(id: number): Promise<void> {
    await db.delete(attachments).where(eq(attachments.id, id));
  }

  // Dashboard stats
  async getDashboardStats(userId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    upcomingEvents: number;
    totalAttachments: number;
  }> {
    const allTasks = await this.getTasks(userId);
    const allEvents = await this.getEvents(userId);
    const allAttachments = await this.getAttachments(userId);
    
    const now = new Date();
    const upcomingEvents = allEvents.filter(e => e.startTime > now).length;
    
    return {
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === "completed").length,
      pendingTasks: allTasks.filter(t => t.status === "pending").length,
      upcomingEvents,
      totalAttachments: allAttachments.length,
    };
  }
}

export const secretaryStorage = new SecretaryStorage();
