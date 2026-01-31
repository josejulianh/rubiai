import express, { type Express, type Request, type Response } from "express";
import { isAuthenticated } from "../auth";
import { openai, speechToText, ensureCompatibleFormat, textToSpeech } from "./client";

const audioBodyParser = express.json({ limit: "50mb" });

export function registerAudioRoutes(app: Express): void {
  app.post("/api/transcribe", isAuthenticated, audioBodyParser, async (req: any, res: Response) => {
    try {
      const { audio } = req.body;

      if (!audio) {
        return res.status(400).json({ error: "Audio data (base64) is required" });
      }

      const rawBuffer = Buffer.from(audio, "base64");
      const { buffer: audioBuffer, format: inputFormat } = await ensureCompatibleFormat(rawBuffer);

      const transcript = await speechToText(audioBuffer, inputFormat);

      res.json({ transcript });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ error: "Failed to transcribe audio" });
    }
  });

  app.post("/api/transcribe/stream", isAuthenticated, audioBodyParser, async (req: any, res: Response) => {
    try {
      const { audio } = req.body;

      if (!audio) {
        return res.status(400).json({ error: "Audio data (base64) is required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const rawBuffer = Buffer.from(audio, "base64");
      const { buffer: audioBuffer, format: inputFormat } = await ensureCompatibleFormat(rawBuffer);

      const { speechToTextStream } = await import("./client");
      const streamIterator = await speechToTextStream(audioBuffer, inputFormat);

      let fullTranscript = "";
      for await (const chunk of streamIterator) {
        fullTranscript += chunk;
        res.write(`data: ${JSON.stringify({ type: "transcript", data: chunk })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ type: "done", transcript: fullTranscript })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error streaming transcription:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: "error", error: "Failed to transcribe audio" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to transcribe audio" });
      }
    }
  });

  app.post("/api/voice-chat", isAuthenticated, audioBodyParser, async (req: any, res: Response) => {
    try {
      const { audio, voice = "alloy", context = [] } = req.body;

      if (!audio) {
        return res.status(400).json({ error: "Audio data (base64) is required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const rawBuffer = Buffer.from(audio, "base64");
      const { buffer: audioBuffer, format: inputFormat } = await ensureCompatibleFormat(rawBuffer);

      const userTranscript = await speechToText(audioBuffer, inputFormat);
      res.write(`data: ${JSON.stringify({ type: "user_transcript", data: userTranscript })}\n\n`);

      const messages = [
        ...context,
        { role: "user", content: userTranscript }
      ];

      const stream = await openai.chat.completions.create({
        model: "gpt-audio",
        modalities: ["text", "audio"],
        audio: { voice, format: "pcm16" },
        messages,
        stream: true,
      });

      let assistantTranscript = "";

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta as any;
        if (!delta) continue;

        if (delta?.audio?.transcript) {
          assistantTranscript += delta.audio.transcript;
          res.write(`data: ${JSON.stringify({ type: "transcript", data: delta.audio.transcript })}\n\n`);
        }

        if (delta?.audio?.data) {
          res.write(`data: ${JSON.stringify({ type: "audio", data: delta.audio.data })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ type: "done", transcript: assistantTranscript })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error processing voice chat:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: "error", error: "Failed to process voice chat" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to process voice chat" });
      }
    }
  });

  app.post("/api/text-to-speech", isAuthenticated, express.json(), async (req: any, res: Response) => {
    try {
      const { text, voice = "nova" } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const audioBuffer = await textToSpeech(text.slice(0, 4000), voice);

      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", audioBuffer.length.toString());
      res.send(audioBuffer);
    } catch (error) {
      console.error("Error generating speech:", error);
      res.status(500).json({ error: "Failed to generate speech" });
    }
  });
}
