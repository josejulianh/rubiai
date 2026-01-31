import type { Express, Response } from "express";
import { secretaryStorage } from "./storage";
import { isAuthenticated } from "../auth";
import { gamificationStorage } from "../gamification/storage";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().datetime().optional(),
  reminderDate: z.string().datetime().optional(),
  category: z.string().max(50).optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.enum(["daily", "weekly", "monthly"]).optional(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
});

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().max(200).optional(),
  isAllDay: z.boolean().optional(),
  reminderMinutes: z.number().min(0).max(10080).optional(),
  category: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
});

export function registerSecretaryRoutes(app: Express): void {
  // ============ TASKS ============
  
  // Get all tasks
  app.get("/api/tasks", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const status = req.query.status as string | undefined;
      
      const tasks = status 
        ? await secretaryStorage.getTasksByStatus(userId, status)
        : await secretaryStorage.getTasks(userId);
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Get upcoming tasks
  app.get("/api/tasks/upcoming", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 7;
      const tasks = await secretaryStorage.getUpcomingTasks(userId, days);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
      res.status(500).json({ error: "Failed to fetch upcoming tasks" });
    }
  });

  // Create task
  app.post("/api/tasks", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = createTaskSchema.parse(req.body);
      
      const task = await secretaryStorage.createTask({
        ...validatedData,
        userId,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        reminderDate: validatedData.reminderDate ? new Date(validatedData.reminderDate) : undefined,
      });
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // Update task
  app.put("/api/tasks/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid task ID" });
      
      const userId = req.user.claims.sub;
      const existingTask = await secretaryStorage.getTask(id);
      
      if (!existingTask || existingTask.userId !== userId) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      const validatedData = updateTaskSchema.parse(req.body);
      const task = await secretaryStorage.updateTask(id, {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        reminderDate: validatedData.reminderDate ? new Date(validatedData.reminderDate) : undefined,
      });
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Complete task
  app.post("/api/tasks/:id/complete", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid task ID" });
      
      const userId = req.user.claims.sub;
      const existingTask = await secretaryStorage.getTask(id);
      
      if (!existingTask || existingTask.userId !== userId) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      const task = await secretaryStorage.completeTask(id);
      
      // Track task completion for gamification
      await gamificationStorage.incrementStat(userId, 'totalTasksCompleted');
      await gamificationStorage.addPoints(userId, 10);
      await gamificationStorage.updateAchievementProgress(userId, "first_task", 1);
      await gamificationStorage.updateAchievementProgress(userId, "productive", 1);
      await gamificationStorage.updateAchievementProgress(userId, "task_master", 1);
      await gamificationStorage.updateAchievementProgress(userId, "unstoppable", 1);
      await gamificationStorage.updateChallengeProgress(userId, 'complete_task', 1);
      
      res.json(task);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ error: "Failed to complete task" });
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid task ID" });
      
      const userId = req.user.claims.sub;
      const existingTask = await secretaryStorage.getTask(id);
      
      if (!existingTask || existingTask.userId !== userId) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      await secretaryStorage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // ============ CALENDAR EVENTS ============
  
  // Get all events
  app.get("/api/events", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const start = req.query.start ? new Date(req.query.start as string) : undefined;
      const end = req.query.end ? new Date(req.query.end as string) : undefined;
      
      const events = start && end
        ? await secretaryStorage.getEventsByDateRange(userId, start, end)
        : await secretaryStorage.getEvents(userId);
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Create event
  app.post("/api/events", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = createEventSchema.parse(req.body);
      
      const event = await secretaryStorage.createEvent({
        ...validatedData,
        userId,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
      });
      
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  // Update event
  app.put("/api/events/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid event ID" });
      
      const userId = req.user.claims.sub;
      const existingEvent = await secretaryStorage.getEvent(id);
      
      if (!existingEvent || existingEvent.userId !== userId) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      const validatedData = createEventSchema.partial().parse(req.body);
      const event = await secretaryStorage.updateEvent(id, {
        ...validatedData,
        startTime: validatedData.startTime ? new Date(validatedData.startTime) : undefined,
        endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined,
      });
      
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  // Delete event
  app.delete("/api/events/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid event ID" });
      
      const userId = req.user.claims.sub;
      const existingEvent = await secretaryStorage.getEvent(id);
      
      if (!existingEvent || existingEvent.userId !== userId) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      await secretaryStorage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // ============ DASHBOARD ============
  
  // Get dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await secretaryStorage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });
}
