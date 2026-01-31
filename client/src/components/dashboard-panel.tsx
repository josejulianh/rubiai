import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, X, CheckCircle2, Clock, Calendar, 
  TrendingUp, Target, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  upcomingEvents: number;
  totalAttachments: number;
}

interface Task {
  id: number;
  title: string;
  priority: string;
  dueDate: string | null;
  status: string;
}

interface UserPreferences {
  totalInteractions: number;
}

export function DashboardPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: upcomingTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/upcoming"],
  });

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ["/api/user/preferences"],
  });

  const completionRate = stats && stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 7) return `In ${diff} days`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        data-testid="button-dashboard"
      >
        <LayoutDashboard className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-4 md:inset-10 bg-background border border-border rounded-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold gradient-text">{getGreeting()}</h2>
                    <p className="text-muted-foreground">Here's your productivity overview</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} data-testid="button-close-dashboard">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Target className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats?.pendingTasks || 0}</p>
                          <p className="text-xs text-muted-foreground">Pending Tasks</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats?.completedTasks || 0}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats?.upcomingEvents || 0}</p>
                          <p className="text-xs text-muted-foreground">Events</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                          <Zap className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{preferences?.totalInteractions || 0}</p>
                          <p className="text-xs text-muted-foreground">Interactions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Productivity Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Task Completion Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-end justify-between">
                          <span className="text-4xl font-bold gradient-text">{completionRate}%</span>
                          <span className="text-sm text-muted-foreground">
                            {stats?.completedTasks || 0} of {stats?.totalTasks || 0} tasks
                          </span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {completionRate >= 80 ? "Excellent progress! Keep it up!" :
                           completionRate >= 50 ? "Good work! You're halfway there." :
                           completionRate >= 25 ? "Making progress. Stay focused!" :
                           "Let's get started on those tasks!"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upcoming Tasks */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        Upcoming Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {upcomingTasks.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No upcoming tasks</p>
                          <p className="text-xs">You're all caught up!</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {upcomingTasks.slice(0, 5).map((task) => (
                            <div 
                              key={task.id} 
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                            >
                              <span className="text-sm truncate flex-1">{task.title}</span>
                              <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                {formatDueDate(task.dueDate)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Motivational Message */}
                <Card className="mt-6 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-lg font-medium">
                        {stats?.pendingTasks === 0 
                          ? "Amazing! You've completed all your tasks. Time to celebrate!" 
                          : `You have ${stats?.pendingTasks} task${stats?.pendingTasks === 1 ? '' : 's'} waiting. I'm here to help you stay organized!`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        - Rubi, your AI Secretary
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
