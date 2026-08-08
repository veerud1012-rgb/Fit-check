import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI Client lazily/safely
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Assistant Proxy Route
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, userContext, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const ai = getAi();

      const systemInstruction = `You are FitPulse AI Gym Coach, an expert fitness trainer, sports nutritionist, and exercise biomechanics specialist.
You help gym-goers optimize their workouts, progressive overload, diet, exercise selection, form tips, and recovery.

User Context:
${userContext ? JSON.stringify(userContext, null, 2) : "Standard user context."}

Important Directives:
1. Provide practical, highly structured, encouraging, and actionable gym guidance (bullet points, clear numbers, sets, reps, meal breakdowns).
2. SAFETY DISCLAIMER MANDATE: If the user mentions sharp pain, joint injury, swelling, tears, dizziness, or severe medical symptoms, immediately advise them clearly to stop the movement and consult a qualified physician or physical therapist before attempting any further lifting. Never attempt to diagnose medical conditions or give medical prescriptions.
3. Keep responses punchy and gym-focused. Tailor advice to the user's current goal and experience level if provided in context.`;

      // Construct history contents
      const formattedContents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history) {
          formattedContents.push({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.text }],
          });
        }
      }
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "I'm sorry, I couldn't generate a response. Please try again.";
      res.json({ reply: replyText });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({
        error: error?.message || "Failed to communicate with AI Assistant.",
      });
    }
  });

  // Vite development middleware or static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FitPulse Gym App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
