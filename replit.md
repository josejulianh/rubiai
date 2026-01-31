# Rubi - AI Assistant

## Overview
Rubi is an innovative AI assistant powered by Mistral AI (via OpenRouter). It features a futuristic, modern design with a dynamic avatar that reflects emotions, user authentication, conversation history, and a beautiful chat interface.

## Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Mistral AI via OpenRouter (Replit AI Integrations)
- **Auth**: Replit Auth (OpenID Connect)
- **Payments**: Stripe (stripe-replit-sync for webhook handling)

## Key Features
1. **Super Secretary AI** - Rubi acts as a virtual executive assistant for task and schedule management
2. **Rubi Avatar** - Dynamic 3D-styled animated avatar with 10 emotion states and accessories
3. **Streaming Chat** - Real-time streaming responses using Server-Sent Events
4. **Emotion Detection** - Analyzes user messages to adapt responses and avatar mood
5. **Task Management** - Create, prioritize, and track tasks with deadlines
6. **Calendar Events** - Schedule and manage calendar events with reminders
7. **Productivity Dashboard** - View stats, completion rates, and upcoming tasks
8. **Personalization Settings** - Expert/Casual mode, communication style preferences
9. **Auto Theme** - Automatic dark/light mode based on time of day
10. **Conversation History** - Persistent chat history per user
11. **Daily Tips** - Random tips and curiosities displayed on the dashboard
12. **Auto-Learning** - Rubi learns from conversations and remembers user preferences
13. **Creator Attribution** - Rubi knows she was created by Jose Julian Calvo Lopesino

## Phase 3: Gamification & Engagement
- **Achievement System** - 20+ achievements across 5 categories (chat, tasks, streak, games, special)
- **Points & Levels** - 20-level progression system with point thresholds
- **Daily Challenges** - 3 daily challenges (send messages, complete tasks, play games)
- **Streak Tracking** - Current and longest streak with streak-based achievements
- **Mini-Games in Chat** - Interactive games triggered by keywords:
  - "play trivia" - Trivia questions with multiple choice
  - "riddle" - Riddles with hints
  - "word game" - Word scramble puzzles
- **Gamification Panel** - View achievements, stats, challenges, and leaderboard

## Phase 4: Advanced Avatar & PWA
- **Enhanced Avatar** - 10 mood types (happy, thinking, excited, calm, surprised, focused, playful, sleepy, proud, curious)
- **3D Effects** - Gradient glows, highlights, and depth effects
- **Avatar Accessories** - Crown, glasses, headphones, bow, star
- **Custom Colors** - Premium users can set custom avatar colors
- **PWA Support** - Progressive Web App for mobile installation
- **Offline Page** - Friendly offline experience with Rubi branding
- **Service Worker** - Caching and push notification support

## Phase 5: Voice & Transcription
- **Voice Transcription** - Record audio and transcribe meetings/notes using OpenAI Whisper
- **Multi-format Support** - Supports WebM, MP4, OGG, WAV, MP3 audio formats
- **Real-time Processing** - Stream transcription results for long audio files
- **Copy & Download** - Copy transcript to clipboard or download as text file
- **Voice Chat** - Talk to Rubi with voice input and get audio responses

## Premium Subscription (€9.95/month + 14-day free trial)
- **Free Trial** - 14-day free trial with credit card required upfront
- **Custom Rubi Name** - Give your assistant a personalized name
- **Custom Personality** - Define Rubi's personality traits
- **Custom Tone** - Choose communication style (friendly, professional, playful, motivational, sarcastic, serious)
- **Custom Colors** - Personalize the interface colors
- **Priority Support** - Get priority assistance
- **Payment via Stripe** - Secure card payments with monthly or yearly billing

## Project Structure
```
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities
│   │   └── pages/          # Page components
├── server/                 # Backend Express server
│   ├── replit_integrations/
│   │   ├── auth/           # Replit Auth integration
│   │   ├── audio/          # Voice transcription and chat
│   │   ├── chat/           # Chat routes and storage
│   │   ├── gamification/   # Achievements, games, points system
│   │   ├── image/          # Image generation
│   │   ├── secretary/      # Tasks and calendar management
│   │   └── batch/          # Batch processing utilities
│   ├── db.ts               # Database connection
│   ├── routes.ts           # API routes
│   └── storage.ts          # Storage interface
├── shared/
│   ├── schema.ts           # Main schema exports
│   └── models/             # Drizzle ORM models
│       ├── auth.ts         # Users and sessions
│       └── chat.ts         # Conversations and messages
```

## API Routes
### Authentication
- `GET /api/login` - Initiate Replit Auth login
- `GET /api/logout` - Logout user
- `GET /api/auth/user` - Get current user (protected)

### Chat
- `GET /api/conversations` - List user's conversations (protected)
- `POST /api/conversations` - Create new conversation (protected)
- `GET /api/conversations/:id` - Get conversation with messages (protected)
- `DELETE /api/conversations/:id` - Delete conversation (protected)
- `POST /api/conversations/:id/messages` - Send message and get AI response (streaming, protected)
- `POST /api/detect-emotion` - Detect emotion in text (protected)

### Tasks (Super Secretary)
- `GET /api/tasks` - List all tasks (protected)
- `GET /api/tasks/upcoming` - Get upcoming tasks (protected)
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `POST /api/tasks/:id/complete` - Mark task complete (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

### Calendar Events
- `GET /api/events` - List events (protected)
- `POST /api/events` - Create event (protected)
- `PUT /api/events/:id` - Update event (protected)
- `DELETE /api/events/:id` - Delete event (protected)

### Dashboard
- `GET /api/dashboard/stats` - Get productivity statistics (protected)

### Preferences
- `GET /api/user/preferences` - Get user preferences (protected)
- `PUT /api/user/preferences` - Update preferences (protected)

### Stripe/Premium
- `GET /api/stripe/config` - Get Stripe publishable key
- `GET /api/stripe/products` - List available subscription products
- `GET /api/stripe/subscription` - Get user subscription status (protected)
- `POST /api/stripe/checkout` - Create checkout session (protected)
- `POST /api/stripe/portal` - Open customer portal (protected)
- `PUT /api/stripe/customization` - Update premium customization (protected)
- `POST /api/stripe/webhook` - Stripe webhook handler

## Design System
- **Primary Color**: Purple (280° hue)
- **Accent Color**: Pink (320° hue)  
- **Secondary Color**: Blue (200° hue)
- **Font**: Space Grotesk (sans), JetBrains Mono (mono)
- **Theme**: Futuristic cyberpunk aesthetic with gradient effects

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `AI_INTEGRATIONS_OPENROUTER_BASE_URL` - OpenRouter API base URL
- `AI_INTEGRATIONS_OPENROUTER_API_KEY` - OpenRouter API key (auto-configured)

## Future Enhancement Ideas

### Phase 2 - Advanced Features
- **Advanced Memory**: Remember preferences, communication style, and favorite topics per user
- **Emotional Adaptation**: Detect emotions in text and adjust responses with appropriate tone
- **Expert vs Casual Mode**: Toggle between technical and friendly/fun response styles
- **Voice Integration**: Text-to-speech for Rubi's responses

### Phase 3 - Gamification & Engagement
- **Mini-games**: Puzzles, trivia, riddles, and interactive challenges in chat
- **Achievement System**: Points, medals, stickers for avatar, interaction rankings
- **Daily Surprises**: Calendar integration, interactive reminders, curiosities

### Phase 4 - Advanced Avatar & Multi-platform
- **3D Avatar**: WebGL/Three.js for immersive 3D Rubi with full expressions
- **Avatar Customization**: Clothing, accessories, colors
- **Multi-platform**: Discord, Telegram, Slack integration, PWA

## Development
```bash
npm run dev      # Start development server
npm run db:push  # Push schema changes to database
```
