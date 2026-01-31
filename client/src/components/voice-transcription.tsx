import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, Square, FileAudio, Loader2, Copy, Check, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

type RecordingState = "idle" | "recording" | "processing";

export function VoiceTranscription() {
  const [state, setState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [copied, setCopied] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      setRecordingTime(0);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(100);
      setState("recording");

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono. Por favor, permite el acceso.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;

    return new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recorder.stream.getTracks().forEach((t) => t.stop());
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  const handleRecordClick = useCallback(async () => {
    if (state === "recording") {
      setState("processing");
      const blob = await stopRecording();
      if (!blob || blob.size === 0) {
        setState("idle");
        return;
      }

      try {
        const base64Audio = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(blob);
        });

        const response = await apiRequest("POST", "/api/transcribe", { audio: base64Audio });
        const data = await response.json();
        setTranscript((prev) => prev + (prev ? "\n\n" : "") + data.transcript);
        setState("idle");
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo transcribir el audio. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
        setState("idle");
      }
    } else {
      await startRecording();
    }
  }, [state, stopRecording, startRecording, toast]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copiado", description: "Transcripción copiada al portapapeles" });
  }, [transcript, toast]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcripcion-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-5 w-5 text-primary" />
          Transcripción de Audio
        </CardTitle>
        <CardDescription>
          Graba audio para transcribir reuniones, notas de voz o cualquier conversación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <motion.div
            animate={state === "recording" ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Button
              size="lg"
              variant={state === "recording" ? "destructive" : "default"}
              onClick={handleRecordClick}
              disabled={state === "processing"}
              className="h-16 w-16 rounded-full"
              data-testid="button-record"
            >
              {state === "processing" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : state === "recording" ? (
                <Square className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          </motion.div>

          <AnimatePresence>
            {state === "recording" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-sm text-center text-muted-foreground">
          {state === "idle" && "Pulsa para grabar"}
          {state === "recording" && "Grabando... Pulsa para detener"}
          {state === "processing" && "Transcribiendo..."}
        </p>

        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Transcripción</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  data-testid="button-copy-transcript"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDownload}
                  data-testid="button-download-transcript"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="whitespace-pre-wrap text-sm" data-testid="text-transcript">
                {transcript}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTranscript("")}
              data-testid="button-clear-transcript"
            >
              Limpiar transcripción
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
