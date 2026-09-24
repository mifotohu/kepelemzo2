import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        prompt: {
            type: Type.STRING,
            description: "A detailed, highly probable text prompt that could have been used to create the image. Capture the essence, style, and subject matter."
        }
    },
    required: ["prompt"]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '50mb' }));

  app.post("/api/analyze", async (req, res) => {
    try {
      const { base64Image, mimeType } = req.body;
      if (!base64Image || !mimeType) {
        return res.status(400).json({ error: "Missing image data or mime type." });
      }

      const authHeader = req.headers.authorization;
      let apiKey = process.env.GEMINI_API_KEY;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
          apiKey = authHeader.split(' ')[1];
      }

      if (!apiKey) {
        return res.status(500).json({ error: "Server configuration error: Gemini API key is missing." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const textPart = {
          text: `Analyze this AI-generated image. Based on its style, artifacts, and characteristics, determine a detailed, highly probable text prompt that could have been used to create it.
          Respond ONLY with a JSON object that adheres to the provided schema.`
      };

      const imagePart = {
          inlineData: {
              data: base64Image,
              mimeType: mimeType
          }
      };

      const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: { parts: [textPart, imagePart] },
          config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
          }
      });

      const jsonText = response.text.trim();
      let result;
      try {
          result = JSON.parse(jsonText);
      } catch (err) {
          console.error("Failed to parse Gemini response as JSON:", jsonText);
          return res.status(500).json({ error: "Could not parse the analysis result from the AI." });
      }
      
      if (result && typeof result.prompt === 'string') {
          res.json({ prompt: result.prompt });
      } else {
          res.status(500).json({ error: "Invalid JSON structure received from API." });
      }
    } catch (err) {
      console.error("Error analyzing image:", err);
      const errorMessage = (err instanceof Error) ? err.message : "Unknown error occurred.";
      res.status(500).json({ error: errorMessage });
    }
  });

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
