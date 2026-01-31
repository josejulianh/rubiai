import { MessageSquare, CheckSquare, Calendar, BarChart3, Settings, Sparkles, FileText, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickActionsProps {
  onNewChat: () => void;
  onOpenTasks: () => void;
  onOpenCalendar: () => void;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
}

export function QuickActions({
  onNewChat,
  onOpenTasks,
  onOpenCalendar,
  onOpenDashboard,
  onOpenSettings,
}: QuickActionsProps) {
  const actions = [
    {
      icon: MessageSquare,
      label: "New Chat",
      onClick: onNewChat,
      testId: "quick-action-chat",
      color: "text-primary",
    },
    {
      icon: CheckSquare,
      label: "Tasks",
      onClick: onOpenTasks,
      testId: "quick-action-tasks",
      color: "text-green-500",
    },
    {
      icon: Calendar,
      label: "Calendar",
      onClick: onOpenCalendar,
      testId: "quick-action-calendar",
      color: "text-blue-500",
    },
    {
      icon: BarChart3,
      label: "Dashboard",
      onClick: onOpenDashboard,
      testId: "quick-action-dashboard",
      color: "text-orange-500",
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: onOpenSettings,
      testId: "quick-action-settings",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
      {actions.map((action) => (
        <Tooltip key={action.label}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="flex items-center gap-2 px-3"
              data-testid={action.testId}
            >
              <action.icon className={`w-4 h-4 ${action.color}`} />
              <span className="hidden md:inline text-xs">{action.label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{action.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export function FeatureCards() {
  const features = [
    {
      icon: Brain,
      title: "Auto-Learning",
      description: "Rubi learns from your conversations and remembers your preferences",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: CheckSquare,
      title: "Task Manager",
      description: "Organize tasks with priorities, deadlines, and categories",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Calendar,
      title: "Calendar",
      description: "Schedule events and never miss an important date",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      title: "Dashboard",
      description: "Track your productivity with stats and insights",
      color: "from-orange-500 to-yellow-500",
    },
    {
      icon: Sparkles,
      title: "Emotion Detection",
      description: "Rubi adapts her responses to your emotional state",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: FileText,
      title: "Smart Assistant",
      description: "Get help with emails, summaries, and professional writing",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="p-4 rounded-lg border bg-card hover-elevate cursor-pointer"
          data-testid={`feature-card-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
            <feature.icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-medium text-sm">{feature.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
