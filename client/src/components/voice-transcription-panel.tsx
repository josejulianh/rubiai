import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { VoiceTranscription } from "./voice-transcription";

export function VoiceTranscriptionPanel() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-voice-transcription"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <div className="pt-6">
          <VoiceTranscription />
        </div>
      </SheetContent>
    </Sheet>
  );
}
