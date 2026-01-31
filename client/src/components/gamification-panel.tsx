import { useQuery } from "@tanstack/react-query";
import { Trophy, Flame, Star, Target, Award, Crown, Zap, CheckCircle, Lock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface UserStats {
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalMessages: number;
  totalTasksCompleted: number;
  gamesPlayed: number;
  gamesWon: number;
  triviaCorrect: number;
  levelProgress: {
    current: number;
    pointsInLevel: number;
    pointsNeeded: number;
    progressPercent: number;
  };
}

interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement: number;
  isSecret: boolean;
  progress: number;
  unlockedAt: string | null;
  isUnlocked: boolean;
}

interface DailyChallenge {
  id: number;
  challengeType: string;
  targetCount: number;
  currentCount: number;
  bonusPoints: number;
  isCompleted: boolean;
}

const iconMap: Record<string, any> = {
  MessageCircle: Trophy,
  MessagesSquare: Trophy,
  MessageSquarePlus: Trophy,
  CheckCircle: CheckCircle,
  CheckCheck: CheckCircle,
  ListTodo: Target,
  Rocket: Zap,
  Flame: Flame,
  Zap: Zap,
  Star: Star,
  Gamepad2: Trophy,
  Brain: Star,
  Trophy: Trophy,
  Lightbulb: Star,
  Moon: Star,
  Sunrise: Star,
  Crown: Crown,
  Palette: Star,
};

const challengeLabels: Record<string, string> = {
  send_messages: "Send messages",
  complete_task: "Complete a task",
  play_game: "Play a game",
};

interface GamificationPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GamificationPanel({ isOpen, onOpenChange }: GamificationPanelProps) {
  const { data: stats, isLoading: loadingStats } = useQuery<UserStats>({
    queryKey: ["/api/gamification/stats"],
    enabled: isOpen,
  });

  const { data: achievements, isLoading: loadingAch } = useQuery<Achievement[]>({
    queryKey: ["/api/gamification/achievements"],
    enabled: isOpen,
  });

  const { data: challenges } = useQuery<DailyChallenge[]>({
    queryKey: ["/api/gamification/challenges"],
    enabled: isOpen,
  });

  const unlockedCount = achievements?.filter(a => a.isUnlocked).length || 0;
  const totalCount = achievements?.length || 0;

  const groupedAchievements = achievements?.reduce((acc, ach) => {
    const cat = ach.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ach);
    return acc;
  }, {} as Record<string, Achievement[]>) || {};

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="gamification-panel">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements & Progress
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Level & Points */}
          {stats && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{stats.levelProgress.current}</span>
                    </div>
                    <div>
                      <p className="font-semibold" data-testid="text-level">Level {stats.levelProgress.current}</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-points">{stats.totalPoints} points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold" data-testid="text-streak">{stats.currentStreak} day streak</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level Progress</span>
                    <span>{stats.levelProgress.pointsInLevel}/{stats.levelProgress.pointsNeeded}</span>
                  </div>
                  <Progress value={stats.levelProgress.progressPercent} className="h-2" data-testid="progress-level" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Challenges */}
          {challenges && challenges.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Daily Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="flex items-center justify-between" data-testid={`challenge-${challenge.id}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{challengeLabels[challenge.challengeType] || challenge.challengeType}</span>
                        {challenge.isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <Progress 
                        value={(challenge.currentCount / challenge.targetCount) * 100} 
                        className="h-1.5 mt-1" 
                      />
                    </div>
                    <div className="ml-4 text-right">
                      <span className="text-xs text-muted-foreground">{challenge.currentCount}/{challenge.targetCount}</span>
                      <Badge variant="secondary" className="ml-2">+{challenge.bonusPoints}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Award className="w-4 h-4" />
                Achievements
              </h3>
              <Badge variant="outline" data-testid="badge-achievement-count">{unlockedCount}/{totalCount}</Badge>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
                <TabsTrigger value="tasks" className="flex-1">Tasks</TabsTrigger>
                <TabsTrigger value="games" className="flex-1">Games</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-2">
                {achievements?.slice(0, 12).map((ach) => (
                  <AchievementItem key={ach.id} achievement={ach} />
                ))}
              </TabsContent>

              {["chat", "tasks", "games", "streak", "special"].map((cat) => (
                <TabsContent key={cat} value={cat} className="mt-4 space-y-2">
                  {groupedAchievements[cat]?.map((ach) => (
                    <AchievementItem key={ach.id} achievement={ach} />
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Stats */}
          {stats && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Messages</span>
                    <span className="font-medium">{stats.totalMessages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasks Done</span>
                    <span className="font-medium">{stats.totalTasksCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Games Played</span>
                    <span className="font-medium">{stats.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longest Streak</span>
                    <span className="font-medium">{stats.longestStreak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AchievementItem({ achievement }: { achievement: Achievement }) {
  const IconComponent = iconMap[achievement.icon] || Trophy;
  const progressPercent = (achievement.progress / achievement.requirement) * 100;

  if (achievement.isSecret && !achievement.isUnlocked) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 opacity-60" data-testid={`achievement-secret-${achievement.id}`}>
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium">???</p>
          <p className="text-xs text-muted-foreground">Secret Achievement</p>
        </div>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            achievement.isUnlocked 
              ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20" 
              : "bg-muted/50"
          }`}
          data-testid={`achievement-${achievement.id}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            achievement.isUnlocked 
              ? "bg-gradient-to-br from-purple-500 to-pink-500" 
              : "bg-muted"
          }`}>
            <IconComponent className={`w-5 h-5 ${achievement.isUnlocked ? "text-white" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{achievement.name}</p>
              {achievement.isUnlocked && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
            </div>
            {!achievement.isUnlocked && (
              <Progress value={progressPercent} className="h-1 mt-1" />
            )}
          </div>
          <Badge variant={achievement.isUnlocked ? "default" : "secondary"}>
            +{achievement.points}
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p className="font-medium">{achievement.name}</p>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
        {!achievement.isUnlocked && (
          <p className="text-xs mt-1">{achievement.progress}/{achievement.requirement}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
