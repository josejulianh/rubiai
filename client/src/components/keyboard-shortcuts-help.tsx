import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const isMac = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");
  const modKey = isMac ? "⌘" : "Ctrl";

  const shortcutGroups = [
    {
      title: "Navegación",
      shortcuts: [
        { ...SHORTCUTS.TOGGLE_SIDEBAR, keys: [modKey, "B"] },
        { ...SHORTCUTS.FOCUS_CHAT, keys: ["/"] },
      ],
    },
    {
      title: "Crear",
      shortcuts: [
        { ...SHORTCUTS.NEW_CHAT, keys: [modKey, "N"] },
        { ...SHORTCUTS.NEW_TASK, keys: [modKey, "Shift", "T"] },
        { ...SHORTCUTS.NEW_EVENT, keys: [modKey, "Shift", "E"] },
      ],
    },
    {
      title: "Paneles",
      shortcuts: [
        { ...SHORTCUTS.OPEN_TASKS, keys: [modKey, "1"] },
        { ...SHORTCUTS.OPEN_CALENDAR, keys: [modKey, "2"] },
        { ...SHORTCUTS.OPEN_DASHBOARD, keys: [modKey, "3"] },
        { ...SHORTCUTS.OPEN_NOTES, keys: [modKey, "4"] },
        { ...SHORTCUTS.OPEN_POMODORO, keys: [modKey, "5"] },
        { ...SHORTCUTS.OPEN_SETTINGS, keys: [modKey, ","] },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-keyboard-shortcuts">
          <Keyboard className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Atajos de Teclado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">{group.title}</h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Presiona <kbd className="px-1 py-0.5 text-xs bg-muted rounded">?</kbd> en cualquier momento para ver esta ayuda
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
