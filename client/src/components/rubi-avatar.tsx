import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MoodType = "happy" | "thinking" | "excited" | "calm" | "surprised" | "focused" | "playful" | "sleepy" | "proud" | "curious";
type Mood = MoodType;

interface RubiAvatarProps {
  mood?: Mood;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  isTyping?: boolean;
  className?: string;
  customColor?: string;
  accessory?: "none" | "crown" | "glasses" | "headphones" | "bow" | "star";
  style3D?: boolean;
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
  "2xl": "w-48 h-48",
};

const moodColors: Record<Mood, string> = {
  happy: "from-purple-500 via-pink-500 to-blue-500",
  thinking: "from-blue-500 via-cyan-500 to-purple-500",
  excited: "from-pink-500 via-orange-400 to-yellow-400",
  calm: "from-teal-400 via-blue-500 to-purple-500",
  surprised: "from-yellow-400 via-pink-500 to-purple-600",
  focused: "from-indigo-600 via-blue-500 to-cyan-400",
  playful: "from-pink-400 via-purple-500 to-indigo-500",
  sleepy: "from-slate-400 via-purple-300 to-blue-300",
  proud: "from-amber-500 via-orange-500 to-red-500",
  curious: "from-emerald-400 via-teal-500 to-cyan-500",
};

const moodEmojis: Record<Mood, JSX.Element> = {
  happy: (
    <g>
      <circle cx="35" cy="42" r="4" fill="currentColor" />
      <circle cx="65" cy="42" r="4" fill="currentColor" />
      <path d="M35 60 Q50 75 65 60" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  ),
  thinking: (
    <g>
      <circle cx="35" cy="45" r="4" fill="currentColor" />
      <circle cx="65" cy="40" r="4" fill="currentColor" />
      <path d="M38 62 Q50 58 62 62" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="78" cy="25" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="85" cy="18" r="4" fill="currentColor" opacity="0.3" />
    </g>
  ),
  excited: (
    <g>
      <path d="M30 38 L40 42 L30 46" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 38 L60 42 L70 46" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="50" cy="65" rx="12" ry="8" fill="currentColor" />
      <path d="M20 30 L25 25 M80 30 L75 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  calm: (
    <g>
      <path d="M30 45 Q35 42 40 45" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 45 Q65 42 70 45" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 62 Q50 68 60 62" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  ),
  surprised: (
    <g>
      <circle cx="35" cy="42" r="6" stroke="currentColor" strokeWidth="3" fill="none" />
      <circle cx="65" cy="42" r="6" stroke="currentColor" strokeWidth="3" fill="none" />
      <ellipse cx="50" cy="68" rx="8" ry="10" stroke="currentColor" strokeWidth="3" fill="none" />
    </g>
  ),
  focused: (
    <g>
      <rect x="28" y="40" width="14" height="6" rx="2" fill="currentColor" />
      <rect x="58" y="40" width="14" height="6" rx="2" fill="currentColor" />
      <path d="M40 64 L60 64" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
  playful: (
    <g>
      <circle cx="35" cy="42" r="4" fill="currentColor" />
      <motion.g>
        <circle cx="68" cy="42" r="0" fill="currentColor" />
        <path d="M60 40 L72 40 L72 44 L60 44 Z" fill="currentColor" />
      </motion.g>
      <path d="M35 58 Q50 72 65 58" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="72" cy="55" r="8" fill="currentColor" opacity="0.2" />
    </g>
  ),
  sleepy: (
    <g>
      <path d="M28 44 Q35 40 42 44" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M58 44 Q65 40 72 44" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M42 64 Q50 60 58 64" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x="70" y="30" fontSize="12" fill="currentColor" opacity="0.6">z</text>
      <text x="78" y="22" fontSize="10" fill="currentColor" opacity="0.4">z</text>
    </g>
  ),
  proud: (
    <g>
      <circle cx="35" cy="42" r="4" fill="currentColor" />
      <circle cx="65" cy="42" r="4" fill="currentColor" />
      <path d="M35 60 Q50 72 65 60" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M25 38 L32 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M75 38 L68 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  curious: (
    <g>
      <circle cx="35" cy="42" r="5" fill="currentColor" />
      <circle cx="65" cy="38" r="6" fill="currentColor" />
      <path d="M38 62 Q50 66 62 62" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M75 35 Q80 30 77 25" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
};

const accessories = {
  none: null,
  crown: (
    <g>
      <path d="M30 15 L35 5 L42 12 L50 2 L58 12 L65 5 L70 15 L65 20 L35 20 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
      <circle cx="35" cy="8" r="2" fill="#FF6B6B" />
      <circle cx="50" cy="5" r="2" fill="#4ECDC4" />
      <circle cx="65" cy="8" r="2" fill="#9B59B6" />
    </g>
  ),
  glasses: (
    <g>
      <rect x="22" y="38" width="20" height="14" rx="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="58" y="38" width="20" height="14" rx="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M42 45 L58 45" stroke="currentColor" strokeWidth="2" />
      <path d="M22 45 L15 42" stroke="currentColor" strokeWidth="2" />
      <path d="M78 45 L85 42" stroke="currentColor" strokeWidth="2" />
    </g>
  ),
  headphones: (
    <g>
      <path d="M20 50 Q20 25 50 20 Q80 25 80 50" stroke="#333" strokeWidth="4" fill="none" />
      <rect x="12" y="45" width="12" height="18" rx="4" fill="#333" />
      <rect x="76" y="45" width="12" height="18" rx="4" fill="#333" />
      <rect x="14" y="48" width="8" height="12" rx="2" fill="#8B5CF6" />
      <rect x="78" y="48" width="8" height="12" rx="2" fill="#8B5CF6" />
    </g>
  ),
  bow: (
    <g>
      <ellipse cx="35" cy="18" rx="12" ry="8" fill="#FF69B4" />
      <ellipse cx="65" cy="18" rx="12" ry="8" fill="#FF69B4" />
      <circle cx="50" cy="18" r="5" fill="#FF1493" />
      <path d="M45 20 Q50 30 55 20" stroke="#FF69B4" strokeWidth="2" fill="none" />
    </g>
  ),
  star: (
    <g>
      <path d="M50 5 L53 15 L63 15 L55 22 L58 32 L50 26 L42 32 L45 22 L37 15 L47 15 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
    </g>
  ),
};

export function RubiAvatar({ 
  mood = "happy", 
  size = "md", 
  isTyping = false, 
  className,
  customColor,
  accessory = "none",
  style3D = true
}: RubiAvatarProps) {
  const gradientClass = customColor ? "" : moodColors[mood];
  const customGradientStyle = customColor ? { 
    background: `linear-gradient(135deg, ${customColor}, ${adjustColor(customColor, -30)}, ${adjustColor(customColor, 30)})` 
  } : {};

  return (
    <motion.div
      className={cn("relative", sizeClasses[size], className)}
      animate={isTyping ? { scale: [1, 1.05, 1] } : { y: [0, -3, 0] }}
      transition={{
        duration: isTyping ? 0.6 : 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      data-testid="rubi-avatar"
    >
      {style3D && (
        <>
          <div
            className={cn(
              "absolute inset-0 rounded-full opacity-40 blur-xl",
              !customColor && moodColors[mood]
            )}
            style={customColor ? { background: customColor, filter: 'blur(20px)' } : {}}
          />
          <div
            className={cn(
              "absolute inset-1 rounded-full opacity-20 blur-md animate-pulse",
              !customColor && moodColors[mood]
            )}
            style={customColor ? { background: customColor, filter: 'blur(12px)' } : {}}
          />
        </>
      )}
      
      <motion.div
        className={cn(
          "relative w-full h-full rounded-full p-1",
          !customColor && `bg-gradient-to-br ${gradientClass}`
        )}
        style={customGradientStyle}
        animate={isTyping ? {} : { rotate: [0, 2, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {style3D && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
        )}
        
        <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden relative">
          {style3D && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none" />
          )}
          
          <svg
            viewBox="0 0 100 100"
            className="w-3/4 h-3/4 text-foreground relative z-10"
          >
            {moodEmojis[mood]}
            {accessories[accessory]}
          </svg>
        </div>
      </motion.div>
      
      {isTyping && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </motion.div>
      )}
      
      {style3D && (
        <motion.div
          className="absolute -inset-1 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          }}
        />
      )}
    </motion.div>
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
