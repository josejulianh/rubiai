import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Plus, Trash2, Pin, PinOff, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NOTE_COLORS = [
  "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
  "bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800",
  "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
  "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800",
  "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800",
  "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
];

const STORAGE_KEY = "rubi-quick-notes";

export function NotesPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotes(parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt),
        })));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "",
      content: "",
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
    ));
    if (activeNote?.id === id) {
      setActiveNote({ ...activeNote, ...updates, updatedAt: new Date() });
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (activeNote?.id === id) {
      setActiveNote(null);
    }
    toast({ title: "Nota eliminada" });
  };

  const togglePin = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNote(id, { isPinned: !note.isPinned });
    }
  };

  const filteredNotes = notes
    .filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-notes">
          <StickyNote className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-yellow-500" />
            Notas Rápidas
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-notes"
              />
            </div>
            <Button onClick={createNote} className="gap-2" data-testid="button-new-note">
              <Plus className="w-4 h-4" />
              Nueva
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {activeNote ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveNote(null)}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cerrar
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePin(activeNote.id)}
                      className="h-8 w-8"
                    >
                      {activeNote.isPinned ? (
                        <PinOff className="w-4 h-4" />
                      ) : (
                        <Pin className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote(activeNote.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  {NOTE_COLORS.map((color, i) => (
                    <button
                      key={i}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-transform",
                        color,
                        activeNote.color === color && "scale-125 ring-2 ring-primary"
                      )}
                      onClick={() => updateNote(activeNote.id, { color })}
                    />
                  ))}
                </div>

                <Input
                  placeholder="Título de la nota..."
                  value={activeNote.title}
                  onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                  className="text-lg font-medium border-0 px-0 focus-visible:ring-0"
                  data-testid="input-note-title"
                />
                
                <Textarea
                  placeholder="Escribe tu nota aquí..."
                  value={activeNote.content}
                  onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                  className="min-h-[300px] resize-none border-0 px-0 focus-visible:ring-0"
                  data-testid="input-note-content"
                />

                <p className="text-xs text-muted-foreground">
                  Última edición: {formatDate(activeNote.updatedAt)}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ScrollArea className="h-[calc(100vh-200px)]">
                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-12">
                      <StickyNote className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "No se encontraron notas" : "No tienes notas aún"}
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="ghost"
                          onClick={createNote}
                          className="mt-2 text-primary"
                        >
                          Crear tu primera nota
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {filteredNotes.map((note) => (
                        <motion.div
                          key={note.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => setActiveNote(note)}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer hover-elevate transition-colors",
                            note.color
                          )}
                          data-testid={`note-item-${note.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {note.isPinned && (
                                  <Pin className="w-3 h-3 text-primary shrink-0" />
                                )}
                                <h4 className="font-medium truncate">
                                  {note.title || "Sin título"}
                                </h4>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {note.content || "Sin contenido"}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDate(note.updatedAt)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
