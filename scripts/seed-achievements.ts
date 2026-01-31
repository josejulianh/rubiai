// Seed default achievements
import { db } from "../server/db";
import { achievements } from "../shared/schema";
import { sql } from "drizzle-orm";

const defaultAchievements = [
  // Chat achievements
  { code: "first_message", name: "First Words", description: "Send your first message to Rubi", icon: "MessageCircle", category: "chat", points: 10, requirement: 1 },
  { code: "chatty", name: "Chatterbox", description: "Send 50 messages", icon: "MessagesSquare", category: "chat", points: 50, requirement: 50 },
  { code: "conversationalist", name: "Conversationalist", description: "Send 200 messages", icon: "MessageSquarePlus", category: "chat", points: 100, requirement: 200 },
  { code: "chat_master", name: "Chat Master", description: "Send 1000 messages", icon: "Crown", category: "chat", points: 500, requirement: 1000 },

  // Task achievements
  { code: "first_task", name: "Getting Started", description: "Complete your first task", icon: "CheckCircle", category: "tasks", points: 15, requirement: 1 },
  { code: "productive", name: "Productive", description: "Complete 10 tasks", icon: "CheckCheck", category: "tasks", points: 50, requirement: 10 },
  { code: "task_master", name: "Task Master", description: "Complete 50 tasks", icon: "ListTodo", category: "tasks", points: 150, requirement: 50 },
  { code: "unstoppable", name: "Unstoppable", description: "Complete 200 tasks", icon: "Rocket", category: "tasks", points: 400, requirement: 200 },

  // Streak achievements
  { code: "streak_3", name: "Getting Consistent", description: "Maintain a 3-day streak", icon: "Flame", category: "streak", points: 30, requirement: 1 },
  { code: "streak_7", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "Zap", category: "streak", points: 70, requirement: 1 },
  { code: "streak_30", name: "Monthly Master", description: "Maintain a 30-day streak", icon: "Star", category: "streak", points: 300, requirement: 1 },

  // Game achievements
  { code: "first_game", name: "Let's Play", description: "Play your first game with Rubi", icon: "Gamepad2", category: "games", points: 20, requirement: 1 },
  { code: "trivia_winner", name: "Trivia Champion", description: "Answer 10 trivia questions correctly", icon: "Brain", category: "games", points: 60, requirement: 10 },
  { code: "game_lover", name: "Game Lover", description: "Play 25 games", icon: "Trophy", category: "games", points: 100, requirement: 25 },
  { code: "riddle_solver", name: "Riddle Solver", description: "Solve 5 riddles correctly", icon: "Lightbulb", category: "games", points: 50, requirement: 5 },

  // Special achievements
  { code: "night_owl", name: "Night Owl", description: "Chat with Rubi after midnight", icon: "Moon", category: "special", points: 25, requirement: 1, isSecret: true },
  { code: "early_bird", name: "Early Bird", description: "Chat with Rubi before 6 AM", icon: "Sunrise", category: "special", points: 25, requirement: 1, isSecret: true },
  { code: "premium_member", name: "Premium Member", description: "Subscribe to Rubi Premium", icon: "Crown", category: "special", points: 100, requirement: 1 },
  { code: "customizer", name: "Personal Touch", description: "Customize Rubi's appearance", icon: "Palette", category: "special", points: 30, requirement: 1 },
];

async function seedAchievements() {
  console.log("Seeding achievements...");
  
  for (const ach of defaultAchievements) {
    try {
      await db.insert(achievements).values(ach).onConflictDoNothing();
      console.log(`Added: ${ach.name}`);
    } catch (error) {
      console.log(`Skipped: ${ach.name} (already exists)`);
    }
  }
  
  console.log("Achievements seeded successfully!");
  process.exit(0);
}

seedAchievements().catch(console.error);
