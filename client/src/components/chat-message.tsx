import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RubiAvatar } from "@/components/rubi-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TextToSpeechButton } from "@/components/text-to-speech-button";
import type { User } from "@shared/models/auth";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  user?: User | null;
  isStreaming?: boolean;
}

export function ChatMessage({ content, role, user, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3 p-4", isUser && "flex-row-reverse")}
    >
      {isUser ? (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={user?.profileImageUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      ) : (
        <RubiAvatar size="sm" mood={isStreaming ? "thinking" : "happy"} isTyping={isStreaming} className="shrink-0" />
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed group relative",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-md"
            : "bg-muted rounded-tl-md"
        )}
        data-testid={isUser ? "message-user" : "message-assistant"}
      >
        <div className="whitespace-pre-wrap break-words" data-testid="message-content">
          {content}
          {isStreaming && !content && (
            <span className="typing-indicator inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
            </span>
          )}
        </div>
        {!isUser && content && !isStreaming && (
          <div className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <TextToSpeechButton 
              text={content} 
              className="h-7 w-7 bg-background shadow-sm border"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
