import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import multer from "multer";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

dotenv.config();

const app = express();
const upload = multer();
const port = Number(process.env.PORT);

const clientUrl = process.env.CLIENT_URL;
const origins = clientUrl ? [clientUrl] : [];

app.use(
  cors({
    origin: process.env.DEV_ALLOW_ALL === "1" ? true : origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const groqClient = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function extractPdfText(fileBytes: Buffer): Promise<string> {
  const parser = new PDFParse({ data: fileBytes });
  try {
    const parsed = await parser.getText();
    return (parsed.text || "").trim();
  } catch {
    return "";
  } finally {
    await parser.destroy();
  }
}

type AnalyzeResult = {
  score: number;
  skills_match: string[];
  missing_skills: string[];
  explanation: string;
};

async function analyzeWithAI(cvText: string, job: string): Promise<AnalyzeResult> {
  const systemPrompt =
    "You are a senior CV reviewer. Compare the CV text with the job description and return only valid JSON. " +
    "Your JSON must contain exactly these keys: score (integer 0-100), skills_match (array of strings), " +
    "missing_skills (array of strings), explanation (string). " +
    "Score should reflect overall fit, not just keyword overlap. " +
    "Explanation should be concise, practical remarks for the candidate.";

  const userPrompt = `
Job description:
${job}

CV text:
${cvText}

Return only JSON.
`;

  const response = await groqClient.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";
  const data = JSON.parse(content) as Partial<AnalyzeResult> & { score?: number | string };

  return {
    score: Number.parseInt(String(data.score ?? 0), 10) || 0,
    skills_match: Array.isArray(data.skills_match) ? data.skills_match.map(String) : [],
    missing_skills: Array.isArray(data.missing_skills) ? data.missing_skills.map(String) : [],
    explanation: String(data.explanation ?? ""),
  };
}

app.post("/analyze", upload.single("cv"), async (req: Request, res: Response) => {
  try {
    if (!req.file?.originalname) {
      return res.status(400).json({ detail: "CV file is required" });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(500).json({ detail: "AI_API_KEY is missing from server environment" });
    }

    const job = String(req.body?.job || "");
    const cvText = await extractPdfText(req.file.buffer);

    if (!cvText) {
      return res.status(400).json({ detail: "Could not extract text from the PDF" });
    }

    const result = await analyzeWithAI(cvText, job);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return res.status(500).json({ detail: message });
  }
});

app.listen(port, () => {
  console.log(`Express CV analyzer listening on port ${port}`);
});
