import { useEffect, useCallback } from "react";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.isContentEditable) {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export const SHORTCUTS = {
  NEW_CHAT: { key: "n", ctrl: true, description: "Nueva conversación" },
  NEW_TASK: { key: "t", ctrl: true, shift: true, description: "Nueva tarea" },
  NEW_EVENT: { key: "e", ctrl: true, shift: true, description: "Nuevo evento" },
  TOGGLE_SIDEBAR: { key: "b", ctrl: true, description: "Mostrar/ocultar sidebar" },
  FOCUS_CHAT: { key: "/", description: "Enfocar chat" },
  OPEN_SETTINGS: { key: ",", ctrl: true, description: "Abrir configuración" },
  OPEN_TASKS: { key: "1", ctrl: true, description: "Abrir tareas" },
  OPEN_CALENDAR: { key: "2", ctrl: true, description: "Abrir calendario" },
  OPEN_DASHBOARD: { key: "3", ctrl: true, description: "Abrir dashboard" },
  OPEN_NOTES: { key: "4", ctrl: true, description: "Abrir notas" },
  OPEN_POMODORO: { key: "5", ctrl: true, description: "Abrir Pomodoro" },
};
