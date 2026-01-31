import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Brain, Timer, X, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TimerMode = "work" | "shortBreak" | "longBreak";

const DEFAULT_TIMES = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
};

export function PomodoroTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_TIMES);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalTime = settings[mode] * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      playNotification();
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const playNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(mode === "work" ? "Break time!" : "Time to work!", {
        body: mode === "work" 
          ? "Great work! Take a well-deserved break." 
          : "Break is over. Let's get back to work!",
        icon: "/icons/icon-192x192.png",
      });
    }
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAM");
      audio.play().catch(() => {});
    } catch {}
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === "work") {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      
      if (newSessions % 4 === 0) {
        setMode("longBreak");
        setTimeLeft(settings.longBreak * 60);
      } else {
        setMode("shortBreak");
        setTimeLeft(settings.shortBreak * 60);
      }
    } else {
      setMode("work");
      setTimeLeft(settings.work * 60);
    }
  };

  const toggleTimer = () => {
    if (!isRunning && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const modeConfig = {
    work: { icon: Brain, label: "Trabajo", color: "text-primary", bgColor: "bg-primary/10" },
    shortBreak: { icon: Coffee, label: "Descanso", color: "text-green-500", bgColor: "bg-green-500/10" },
    longBreak: { icon: Coffee, label: "Descanso largo", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  };

  const CurrentIcon = modeConfig[mode].icon;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-pomodoro">
          <Timer className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            Pomodoro Timer
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex gap-2 justify-center">
            {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => {
              const config = modeConfig[m];
              return (
                <Button
                  key={m}
                  variant={mode === m ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchMode(m)}
                  className="gap-2"
                  data-testid={`button-mode-${m}`}
                >
                  <config.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="relative">
            <motion.div
              className={cn(
                "mx-auto w-48 h-48 rounded-full flex items-center justify-center",
                modeConfig[mode].bgColor
              )}
              animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
            >
              <div className="text-center">
                <CurrentIcon className={cn("w-8 h-8 mx-auto mb-2", modeConfig[mode].color)} />
                <div className="text-4xl font-mono font-bold">{formatTime(timeLeft)}</div>
                <div className="text-sm text-muted-foreground mt-1">{modeConfig[mode].label}</div>
              </div>
            </motion.div>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-52 h-52 -rotate-90">
                <circle
                  cx="104"
                  cy="104"
                  r="96"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="104"
                  cy="104"
                  r="96"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className={modeConfig[mode].color}
                  strokeDasharray={2 * Math.PI * 96}
                  strokeDashoffset={2 * Math.PI * 96 * (1 - progress / 100)}
                />
              </svg>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              variant={isRunning ? "secondary" : "default"}
              onClick={toggleTimer}
              className="gap-2 w-32"
              data-testid="button-toggle-timer"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Iniciar
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={resetTimer}
              data-testid="button-reset-timer"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Sesiones completadas: <span className="font-medium text-foreground">{sessions}</span>
          </div>

          <AnimatePresence>
            {showSettings ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Configuración</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Label className="w-32 text-xs">Trabajo (min)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.work}
                      onChange={(e) => setSettings({ ...settings, work: parseInt(e.target.value) || 25 })}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="w-32 text-xs">Descanso (min)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreak}
                      onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) || 5 })}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="w-32 text-xs">Descanso largo (min)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreak}
                      onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) || 15 })}
                      className="w-20"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2"
                onClick={() => setShowSettings(true)}
              >
                <Settings2 className="w-4 h-4" />
                Configuración
              </Button>
            )}
          </AnimatePresence>

          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">
              La técnica Pomodoro: 25 min de trabajo, 5 min de descanso.
              <br />
              Después de 4 sesiones, toma un descanso largo de 15 min.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
