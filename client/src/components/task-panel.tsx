import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ListTodo, Plus, X, Check, Calendar, Clock, Flag, Trash2, 
  ChevronDown, ChevronRight, AlertCircle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  category: string | null;
  createdAt: string;
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function TaskPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", dueDate: "" });
  const { toast } = useToast();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: typeof newTask) => {
      const payload: Record<string, unknown> = { 
        title: data.title, 
        priority: data.priority 
      };
      if (data.description) payload.description = data.description;
      if (data.dueDate) payload.dueDate = new Date(data.dueDate).toISOString();
      
      const res = await apiRequest("POST", "/api/tasks", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "" });
      setIsCreating(false);
      toast({ title: "Task created", description: "Your task has been added." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/tasks/${id}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task completed", description: "Great job!" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: "Overdue", isOverdue: true };
    if (days === 0) return { text: "Today", isOverdue: false };
    if (days === 1) return { text: "Tomorrow", isOverdue: false };
    return { text: date.toLocaleDateString(), isOverdue: false };
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
        data-testid="button-tasks"
      >
        <ListTodo className="w-5 h-5" />
        {pendingTasks.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
            {pendingTasks.length}
          </span>
        )}
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
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold gradient-text">My Tasks</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => setIsCreating(true)}
                      data-testid="button-create-task"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} data-testid="button-close-tasks">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Create Task Form */}
                <AnimatePresence>
                  {isCreating && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4"
                    >
                      <Card>
                        <CardContent className="pt-4 space-y-3">
                          <Input
                            placeholder="Task title..."
                            value={newTask.title}
                            onChange={(e) => setNewTask(p => ({ ...p, title: e.target.value }))}
                            data-testid="input-task-title"
                          />
                          <Textarea
                            placeholder="Description (optional)..."
                            value={newTask.description}
                            onChange={(e) => setNewTask(p => ({ ...p, description: e.target.value }))}
                            className="min-h-[60px]"
                            data-testid="input-task-description"
                          />
                          <div className="flex gap-2">
                            <Select
                              value={newTask.priority}
                              onValueChange={(v) => setNewTask(p => ({ ...p, priority: v }))}
                            >
                              <SelectTrigger className="w-32" data-testid="select-task-priority">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="date"
                              value={newTask.dueDate}
                              onChange={(e) => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                              className="flex-1"
                              data-testid="input-task-due-date"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1" 
                              onClick={() => createTaskMutation.mutate(newTask)}
                              disabled={!newTask.title || createTaskMutation.isPending}
                              data-testid="button-save-task"
                            >
                              Create Task
                            </Button>
                            <Button variant="outline" onClick={() => setIsCreating(false)}>
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pending Tasks */}
                <div className="space-y-2 mb-6">
                  {pendingTasks.length === 0 && !isCreating && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No pending tasks</p>
                        <p className="text-xs">Click "New" to add a task</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {pendingTasks.map((task) => {
                    const dueInfo = formatDate(task.dueDate);
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                      >
                        <Card className="hover-elevate" data-testid={`task-${task.id}`}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 h-6 w-6 rounded-full"
                                onClick={() => completeTaskMutation.mutate(task.id)}
                                data-testid={`button-complete-task-${task.id}`}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className={`${priorityColors[task.priority]} text-white text-xs`}>
                                    {priorityLabels[task.priority]}
                                  </Badge>
                                  {dueInfo && (
                                    <span className={`text-xs flex items-center gap-1 ${dueInfo.isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                                      {dueInfo.isOverdue && <AlertCircle className="w-3 h-3" />}
                                      <Clock className="w-3 h-3" />
                                      {dueInfo.text}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteTaskMutation.mutate(task.id)}
                                data-testid={`button-delete-task-${task.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                  <div>
                    <button
                      className="flex items-center gap-2 text-sm text-muted-foreground mb-2 hover:text-foreground"
                      onClick={() => setShowCompleted(!showCompleted)}
                      data-testid="button-toggle-completed"
                    >
                      {showCompleted ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      Completed ({completedTasks.length})
                    </button>
                    
                    <AnimatePresence>
                      {showCompleted && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          {completedTasks.map((task) => (
                            <Card key={task.id} className="opacity-60">
                              <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                  <p className="flex-1 line-through text-muted-foreground truncate">{task.title}</p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 h-6 w-6"
                                    onClick={() => deleteTaskMutation.mutate(task.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
