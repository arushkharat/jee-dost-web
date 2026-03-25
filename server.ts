import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Gemini Proxy Route (for Vercel-like backend support)
  app.post("/api/chat", async (req, res) => {
    const { question, contents, config } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set on the server.");
      return res.status(500).json({ error: "GEMINI_API_KEY not set on server" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Support both the user's simplified request and the app's complex request
      const modelContents = contents || [{ parts: [{ text: question }] }];
      const modelConfig = config || {};

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: modelContents,
        config: modelConfig
      });

      res.json(response);
    } catch (error: any) {
      console.error("Backend Gemini Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
