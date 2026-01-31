import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Menu, LogOut, ChevronLeft, Trophy } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts, SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";
import { RubiAvatar, type MoodType } from "@/components/rubi-avatar";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { ConversationList } from "@/components/conversation-list";
import { WelcomeMessage } from "@/components/welcome-message";
import { DailyTip } from "@/components/daily-tip";
import { SettingsPanel } from "@/components/settings-panel";
import { TaskPanel } from "@/components/task-panel";
import { DashboardPanel } from "@/components/dashboard-panel";
import { CalendarPanel } from "@/components/calendar-panel";
import { PremiumPanel } from "@/components/premium-panel";
import { GamificationPanel } from "@/components/gamification-panel";
import { VoiceTranscriptionPanel } from "@/components/voice-transcription-panel";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { NotesPanel } from "@/components/notes-panel";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Conversation, Message } from "@shared/models/chat";

interface ConversationWithMessages extends Conversation {
  messages?: Message[];
}

export default function Home() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showTip, setShowTip] = useState(true);
  const [rubiMood, setRubiMood] = useState<MoodType>("happy");
  const [gamificationOpen, setGamificationOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: activeConversation } = useQuery<ConversationWithMessages>({
    queryKey: ["/api/conversations", activeConversationId],
    enabled: !!activeConversationId,
  });

  useEffect(() => {
    if (activeConversation?.messages) {
      setLocalMessages(activeConversation.messages);
    }
  }, [activeConversation?.messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, streamingContent]);

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/conversations", { title: "New Chat" });
      return res.json();
    },
    onSuccess: (newConversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConversationId(newConversation.id);
      setLocalMessages([]);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (activeConversationId === deletedId) {
        setActiveConversationId(null);
        setLocalMessages([]);
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete conversation", variant: "destructive" });
    },
  });

  const sendMessage = useCallback(async (content: string) => {
    let conversationId = activeConversationId;

    if (!conversationId) {
      try {
        const res = await apiRequest("POST", "/api/conversations", { title: content.slice(0, 50) });
        const newConversation = await res.json();
        conversationId = newConversation.id;
        setActiveConversationId(conversationId);
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      } catch {
        toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now(),
      conversationId: conversationId!,
      role: "user",
      content,
      createdAt: new Date(),
    };

    setLocalMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                // Handle emotion detection for avatar mood
                if (data.emotion) {
                  setRubiMood(data.emotion.suggestedMood as MoodType);
                }
                if (data.content) {
                  fullContent += data.content;
                  setStreamingContent(fullContent);
                }
                if (data.done) {
                  // Reset to happy after response is done
                  setTimeout(() => setRubiMood("happy"), 2000);
                  const assistantMessage: Message = {
                    id: Date.now() + 1,
                    conversationId: conversationId!,
                    role: "assistant",
                    content: fullContent,
                    createdAt: new Date(),
                  };
                  setLocalMessages((prev) => [...prev, assistantMessage]);
                  setStreamingContent("");
                  queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
                }
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setIsStreaming(false);
    }
  }, [activeConversationId, toast]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-72 border-r border-border bg-sidebar flex flex-col shrink-0"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <RubiAvatar size="sm" mood={rubiMood} />
                <span className="text-lg font-bold gradient-text">Rubi</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
                data-testid="button-close-sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-hidden">
              <ConversationList
                conversations={conversations}
                activeId={activeConversationId ?? undefined}
                onSelect={setActiveConversationId}
                onCreate={() => createConversationMutation.mutate()}
                onDelete={(id) => deleteConversationMutation.mutate(id)}
                isCreating={createConversationMutation.isPending}
              />
            </div>

            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                data-testid="button-open-sidebar"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            {activeConversation ? (
              <h1 className="text-lg font-semibold truncate">{activeConversation.title}</h1>
            ) : (
              <h1 className="text-lg font-semibold">New Chat</h1>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <TaskPanel />
                </div>
              </TooltipTrigger>
              <TooltipContent>Tasks</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <CalendarPanel />
                </div>
              </TooltipTrigger>
              <TooltipContent>Calendar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DashboardPanel />
                </div>
              </TooltipTrigger>
              <TooltipContent>Dashboard</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <SettingsPanel />
                </div>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <PremiumPanel />
                </div>
              </TooltipTrigger>
              <TooltipContent>Rubi Premium</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <VoiceTranscriptionPanel />
                </div>
              </TooltipTrigger>
              <TooltipContent>Transcripción de voz</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setGamificationOpen(true)}
                  data-testid="button-gamification"
                >
                  <Trophy className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Achievements</TooltipContent>
            </Tooltip>
            <GamificationPanel isOpen={gamificationOpen} onOpenChange={setGamificationOpen} />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {showTip && localMessages.length === 0 && !activeConversationId && (
            <div className="p-4 shrink-0">
              <DailyTip onClose={() => setShowTip(false)} />
            </div>
          )}

          <ScrollArea className="flex-1">
            {localMessages.length === 0 && !streamingContent ? (
              <WelcomeMessage user={user || null} onSuggestionClick={handleSuggestionClick} />
            ) : (
              <div className="pb-4">
                {localMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    content={message.content}
                    role={message.role as "user" | "assistant"}
                    user={user}
                  />
                ))}
                {isStreaming && (
                  <ChatMessage
                    content={streamingContent}
                    role="assistant"
                    isStreaming={true}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <ChatInput
            onSend={sendMessage}
            isLoading={isStreaming}
            placeholder={localMessages.length === 0 ? "Start a conversation with Rubi..." : "Continue chatting..."}
          />
        </div>
      </main>
    </div>
  );
}
