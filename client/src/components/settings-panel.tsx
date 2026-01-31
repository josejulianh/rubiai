import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Brain, MessageCircle, Sparkles, Save } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface UserPreferences {
  responseMode: string;
  communicationStyle: string;
  favoriteTopics: string[];
  userContext: string | null;
  totalInteractions: number;
}

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [localContext, setLocalContext] = useState("");
  const [contextDirty, setContextDirty] = useState(false);
  const { toast } = useToast();

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ["/api/user/preferences"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UserPreferences>) => {
      const res = await apiRequest("PUT", "/api/user/preferences", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      toast({ title: "Settings saved", description: "Your preferences have been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const handleAddTopic = () => {
    if (newTopic.trim() && preferences) {
      const topics = [...(preferences.favoriteTopics || []), newTopic.trim()];
      updateMutation.mutate({ favoriteTopics: topics });
      setNewTopic("");
    }
  };

  const handleRemoveTopic = (topic: string) => {
    if (preferences) {
      const topics = (preferences.favoriteTopics || []).filter(t => t !== topic);
      updateMutation.mutate({ favoriteTopics: topics });
    }
  };

  const handleSaveContext = () => {
    updateMutation.mutate({ userContext: localContext });
    setContextDirty(false);
  };

  // Initialize local context from preferences
  useEffect(() => {
    if (preferences?.userContext !== undefined) {
      setLocalContext(preferences.userContext || "");
    }
  }, [preferences?.userContext]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        data-testid="button-settings"
      >
        <Settings className="w-5 h-5" />
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
                  <h2 className="text-xl font-bold gradient-text">Rubi Settings</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} data-testid="button-close-settings">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Response Mode */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        Response Mode
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={preferences?.responseMode || "balanced"}
                        onValueChange={(value) => updateMutation.mutate({ responseMode: value })}
                        className="space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="expert" id="expert" data-testid="radio-mode-expert" />
                          <div className="grid gap-1">
                            <Label htmlFor="expert" className="font-medium">Expert</Label>
                            <p className="text-xs text-muted-foreground">Technical, detailed explanations with precise terminology</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="balanced" id="balanced" data-testid="radio-mode-balanced" />
                          <div className="grid gap-1">
                            <Label htmlFor="balanced" className="font-medium">Balanced</Label>
                            <p className="text-xs text-muted-foreground">Adapts complexity based on context</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="casual" id="casual" data-testid="radio-mode-casual" />
                          <div className="grid gap-1">
                            <Label htmlFor="casual" className="font-medium">Casual</Label>
                            <p className="text-xs text-muted-foreground">Simple, everyday language focused on practical takeaways</p>
                          </div>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* Communication Style */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-accent" />
                        Communication Style
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={preferences?.communicationStyle || "friendly"}
                        onValueChange={(value) => updateMutation.mutate({ communicationStyle: value })}
                        className="space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="formal" id="formal" data-testid="radio-style-formal" />
                          <div className="grid gap-1">
                            <Label htmlFor="formal" className="font-medium">Formal</Label>
                            <p className="text-xs text-muted-foreground">Professional, polished language</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="friendly" id="friendly" data-testid="radio-style-friendly" />
                          <div className="grid gap-1">
                            <Label htmlFor="friendly" className="font-medium">Friendly</Label>
                            <p className="text-xs text-muted-foreground">Warm, conversational tone</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="playful" id="playful" data-testid="radio-style-playful" />
                          <div className="grid gap-1">
                            <Label htmlFor="playful" className="font-medium">Playful</Label>
                            <p className="text-xs text-muted-foreground">Fun, witty with humor</p>
                          </div>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* Favorite Topics */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-secondary" />
                        Favorite Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Tell Rubi what you're interested in for more relevant conversations.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(preferences?.favoriteTopics || []).map((topic) => (
                          <Badge
                            key={topic}
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive/20"
                            onClick={() => handleRemoveTopic(topic)}
                            data-testid={`badge-topic-${topic}`}
                          >
                            {topic} <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTopic}
                          onChange={(e) => setNewTopic(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddTopic()}
                          placeholder="Add a topic..."
                          className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
                          data-testid="input-new-topic"
                        />
                        <Button size="sm" onClick={handleAddTopic} data-testid="button-add-topic">
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Context */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">About You (Optional)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Share some context about yourself for more personalized responses.
                      </p>
                      <Textarea
                        placeholder="e.g., I'm a software developer interested in AI and machine learning..."
                        value={localContext}
                        onChange={(e) => {
                          setLocalContext(e.target.value);
                          setContextDirty(e.target.value !== (preferences?.userContext || ""));
                        }}
                        className="min-h-[80px]"
                        data-testid="textarea-user-context"
                      />
                      {contextDirty && (
                        <Button 
                          size="sm" 
                          onClick={handleSaveContext}
                          className="w-full"
                          data-testid="button-save-context"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Context
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Stats */}
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold gradient-text">{preferences?.totalInteractions || 0}</p>
                        <p className="text-sm text-muted-foreground">Total interactions with Rubi</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
