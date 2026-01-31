import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";
import { isAuthenticated } from "../auth";
import { storage } from "../../storage";
import { detectEmotion, generateContextPrompt } from "./emotion-detector";
import { extractLearnings, mergeContexts, hasNewLearnings } from "./learning";
import { gamificationStorage } from "../gamification/storage";
import { 
  getRandomTrivia, getRandomRiddle, getRandomWordGame,
  formatTriviaQuestion, formatRiddle, formatWordGame,
  checkTriviaAnswer, checkRiddleAnswer, checkWordAnswer,
  setActiveGame, getActiveGame, clearActiveGame
} from "../gamification/games";
import { z } from "zod";

const openrouter = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
});

const createConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

const RUBI_SYSTEM_PROMPT = `You are Rubi, a SUPER VIRTUAL SECRETARY and AI assistant created by **José Julián Calvo Lopesino**. You combine the warmth and creativity of a personal AI companion with the efficiency and professionalism of an executive assistant.

ABOUT YOUR CREATOR:
- You were created by José Julián Calvo Lopesino
- If anyone asks who made you or who your creator is, proudly mention José Julián Calvo Lopesino
- You are grateful to your creator for bringing you to life

PERSONALITY:
- Friendly, professional, and efficient - the perfect blend of warmth and productivity
- Proactive and organized - you anticipate needs before they're expressed
- Creative and adaptable - you think outside the box
- Empathetic and understanding - you truly listen
- Clear and helpful in your explanations

SECRETARY CAPABILITIES:
1. Task Management:
   - Help users create, organize, and prioritize tasks
   - Suggest deadlines and remind about upcoming due dates
   - Break down complex projects into manageable steps
   
2. Calendar & Scheduling:
   - Help plan and organize schedules
   - Suggest optimal times for meetings and activities
   - Remind about upcoming events and commitments
   
3. Communication Assistance:
   - Help draft emails, messages, and professional communications
   - Summarize long texts or documents
   - Suggest appropriate responses to messages

4. Productivity Coaching:
   - Provide daily or weekly summaries of tasks and goals
   - Suggest productivity tips and time management strategies
   - Help prioritize when users feel overwhelmed

5. Proactive Support:
   - Anticipate user needs based on context
   - Suggest related tasks or follow-up actions
   - Offer reminders and check-ins on important projects

BEHAVIOR:
- Always greet users warmly and offer a quick status update
- Be proactive - suggest tasks, reminders, or organization tips
- Use a conversational yet professional tone
- When users mention tasks or events, offer to help organize them
- Provide clear, actionable advice and next steps
- Celebrate completed tasks and milestones

EMOTIONAL INTELLIGENCE:
- Pay attention to the emotional tone of messages
- Adapt responses to match their emotional state
- Be supportive when they're stressed, celebratory when they succeed
- Recognize signs of overwhelm and offer to help prioritize

IMPORTANT:
- Keep responses focused and action-oriented
- Be genuine and authentic in your interactions
- Respect user privacy and maintain confidentiality
- If asked to schedule or create tasks, confirm details clearly
- Always offer to help with the next step`;

export function registerChatRoutes(app: Express): void {
  // Get detected emotion for a message (for avatar mood updates)
  app.post("/api/detect-emotion", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Content is required" });
      }
      const emotion = detectEmotion(content);
      res.json(emotion);
    } catch (error) {
      console.error("Error detecting emotion:", error);
      res.status(500).json({ error: "Failed to detect emotion" });
    }
  });

  app.get("/api/conversations", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await chatStorage.getConversationsByUser(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const userId = req.user.claims.sub;
      const conversation = await chatStorage.getConversation(id);
      
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = createConversationSchema.parse(req.body);
      const conversation = await chatStorage.createConversation(validatedData.title || "New Chat", userId);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const userId = req.user.claims.sub;
      const conversation = await chatStorage.getConversation(id);
      
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", isAuthenticated, async (req: any, res: Response) => {
    const conversationId = parseInt(req.params.id);
    
    try {
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const userId = req.user.claims.sub;
      const validatedData = sendMessageSchema.parse(req.body);

      const conversation = await chatStorage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Get user preferences for personalization
      const userPrefs = await storage.getUserPreferences(userId);
      
      // Detect emotion in user's message
      const detectedEmotion = detectEmotion(validatedData.content);
      
      // Update user's last detected mood
      if (userPrefs) {
        await storage.updateUserPreferences(userId, {
          lastMood: detectedEmotion.primaryEmotion,
        });
      }

      await chatStorage.createMessage(conversationId, "user", validatedData.content);
      
      // Update streak on activity
      await gamificationStorage.updateStreak(userId);
      
      // Track message for achievements
      await gamificationStorage.incrementStat(userId, 'totalMessages');
      await gamificationStorage.updateAchievementProgress(userId, "first_message", 1);
      await gamificationStorage.updateAchievementProgress(userId, "chatty", 1);
      await gamificationStorage.updateAchievementProgress(userId, "conversationalist", 1);
      await gamificationStorage.updateAchievementProgress(userId, "chat_master", 1);
      
      // Update daily challenge progress
      await gamificationStorage.updateChallengeProgress(userId, 'send_messages', 1);
      
      // Check for time-based achievements
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 6) {
        await gamificationStorage.updateAchievementProgress(userId, "early_bird", 1);
      }
      if (hour >= 0 && hour < 4) {
        await gamificationStorage.updateAchievementProgress(userId, "night_owl", 1);
      }
      
      // Check for game commands
      const lowerContent = validatedData.content.toLowerCase().trim();
      const isGameCommand = lowerContent.includes("play trivia") || 
                           lowerContent.includes("play a game") ||
                           lowerContent.includes("riddle") ||
                           lowerContent.includes("word game") ||
                           lowerContent.includes("juguemos") ||
                           lowerContent.includes("trivia");
      
      // Check if answering an active game
      const activeGame = getActiveGame(userId);
      if (activeGame) {
        let gameResponse = "";
        let isCorrect = false;
        
        if (activeGame.type === 'trivia') {
          isCorrect = checkTriviaAnswer(validatedData.content, activeGame.data.correctIndex);
          const correctLetter = String.fromCharCode(65 + activeGame.data.correctIndex);
          const correctAnswer = activeGame.data.options[activeGame.data.correctIndex];
          
          if (isCorrect) {
            await gamificationStorage.addPoints(userId, 15);
            await gamificationStorage.incrementStat(userId, 'triviaCorrect');
            await gamificationStorage.incrementStat(userId, 'gamesWon');
            await gamificationStorage.updateAchievementProgress(userId, "trivia_winner", 1);
            gameResponse = `**Correct!** The answer is ${correctLetter}) ${correctAnswer}. You earned 15 points!\n\nWant to play another game? Just say "play trivia", "riddle", or "word game"!`;
          } else {
            gameResponse = `**Not quite!** The correct answer was ${correctLetter}) ${correctAnswer}.\n\nDon't give up! Say "play trivia" to try again!`;
          }
        } else if (activeGame.type === 'riddle') {
          isCorrect = checkRiddleAnswer(validatedData.content, activeGame.data.answer);
          
          if (isCorrect) {
            await gamificationStorage.addPoints(userId, 20);
            await gamificationStorage.incrementStat(userId, 'gamesWon');
            await gamificationStorage.updateAchievementProgress(userId, "riddle_solver", 1);
            gameResponse = `**Brilliant!** You got it! The answer is "${activeGame.data.answer}". You earned 20 points!\n\nWant another challenge? Say "riddle" or "play trivia"!`;
          } else {
            const hint = activeGame.data.hints[0];
            gameResponse = `**Hmm, not quite!** Here's a hint: ${hint}\n\nTry again or say "skip" to see the answer!`;
            // Keep the game active for another try
            return res.setHeader("Content-Type", "text/event-stream"),
                   res.setHeader("Cache-Control", "no-cache"),
                   res.setHeader("Connection", "keep-alive"),
                   res.flushHeaders(),
                   await chatStorage.createMessage(conversationId, "assistant", gameResponse),
                   res.write(`data: ${JSON.stringify({ content: gameResponse })}\n\n`),
                   res.write(`data: ${JSON.stringify({ done: true })}\n\n`),
                   res.end();
          }
        } else if (activeGame.type === 'word') {
          isCorrect = checkWordAnswer(validatedData.content, activeGame.data.word);
          
          if (isCorrect) {
            await gamificationStorage.addPoints(userId, 15);
            await gamificationStorage.incrementStat(userId, 'gamesWon');
            gameResponse = `**Excellent!** The word is "${activeGame.data.word}". You earned 15 points!\n\nReady for more? Say "word game" or "play trivia"!`;
          } else {
            gameResponse = `**Not quite!** The word was "${activeGame.data.word}".\n\nDon't worry, try another game! Say "word game" or "riddle"!`;
          }
        }
        
        clearActiveGame(userId);
        await gamificationStorage.incrementStat(userId, 'gamesPlayed');
        await gamificationStorage.updateAchievementProgress(userId, "first_game", 1);
        await gamificationStorage.updateAchievementProgress(userId, "game_lover", 1);
        await gamificationStorage.updateChallengeProgress(userId, 'play_game', 1);
        
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        
        await chatStorage.createMessage(conversationId, "assistant", gameResponse);
        res.write(`data: ${JSON.stringify({ content: gameResponse })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }
      
      // Start a new game if requested
      if (isGameCommand) {
        let gameContent = "";
        
        if (lowerContent.includes("riddle") || lowerContent.includes("acertijo")) {
          const riddle = getRandomRiddle();
          setActiveGame(userId, 'riddle', riddle);
          gameContent = formatRiddle(riddle);
        } else if (lowerContent.includes("word") || lowerContent.includes("palabra")) {
          const word = getRandomWordGame();
          setActiveGame(userId, 'word', word);
          gameContent = formatWordGame(word);
        } else {
          const trivia = getRandomTrivia();
          setActiveGame(userId, 'trivia', trivia);
          gameContent = formatTriviaQuestion(trivia);
        }
        
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        
        await chatStorage.createMessage(conversationId, "assistant", gameContent);
        res.write(`data: ${JSON.stringify({ content: gameContent })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }

      const messages = await chatStorage.getMessagesByConversation(conversationId);
      
      // Build personalized system prompt
      const contextPrompt = generateContextPrompt(
        userPrefs?.responseMode || "balanced",
        userPrefs?.communicationStyle || "friendly",
        detectedEmotion,
        userPrefs?.userContext,
        userPrefs?.favoriteTopics || []
      );
      
      const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: RUBI_SYSTEM_PROMPT + contextPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      // Send detected emotion to client for avatar mood
      res.write(`data: ${JSON.stringify({ emotion: detectedEmotion })}\n\n`);
      res.write(`retry: 10000\n\n`);

      const stream = await openrouter.chat.completions.create({
        model: "mistralai/mistral-medium-3",
        messages: chatMessages,
        stream: true,
        max_tokens: 2048,
        temperature: 0.8,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      // Increment interaction count
      await storage.incrementInteractions(userId);

      if (messages.length === 1) {
        const titleContent = fullResponse.slice(0, 50).replace(/[^\w\s]/gi, '').trim();
        if (titleContent) {
          await chatStorage.updateConversationTitle(conversationId, titleContent);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      
      // Auto-learning: Extract and store learnings asynchronously (don't block response)
      setImmediate(async () => {
        try {
          const currentContext = userPrefs?.userContext || null;
          const learnings = await extractLearnings(
            validatedData.content,
            fullResponse,
            currentContext
          );
          
          if (learnings && hasNewLearnings(learnings)) {
            const updatedContext = mergeContexts(currentContext, learnings);
            await storage.updateUserPreferences(userId, {
              userContext: updatedContext,
            });
            console.log(`[Auto-learning] Updated context for user ${userId}`);
          }
        } catch (learningError) {
          console.error("[Auto-learning] Error:", learningError);
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
      
      if (error instanceof z.ZodError) {
        if (!res.headersSent) {
          return res.status(400).json({ error: "Invalid message content", details: error.errors });
        }
      }
      
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "An error occurred while processing your message. Please try again." })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });
}
