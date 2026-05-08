import "./polyfills.js";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import type { Request, Response } from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.disable("x-powered-by");
const upload = multer();

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    nodeEnv: process.env.NODE_ENV,
    hasApiKey: !!process.env.AI_API_KEY,
    hasGeminiModel: !!process.env.GEMINI_MODEL,
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("The server has been deployed successfully!");
});

// Middleware for parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const geminiClient = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "",
);

type AnalyzeResult = {
  score: number;
  skills_match: string[];
  missing_skills: string[];
  explanation: string;
};

function normalizePhrase(p: string) {
  return p.trim().replace(/[[\s\t\n\r]+/g, " ").replace(/^[\-,:.]+|[\-,:.]+$/g, "").trim();
}

function parseJobSkills(job: string): string[] {
  if (!job || !job.trim()) return [];
  const s = job.replace(/•|\u2022/g, ",");
  let parts = s.split(/[\n;,\/\\|]/).map((p) => p.trim()).filter(Boolean);
  parts = parts.flatMap((p) => p.split(/\band\b|\bor\b/i).map((q) => q.trim()));

  const stopwords = new Set([
    "for",
    "the",
    "and",
    "or",
    "with",
    "a",
    "an",
    "in",
    "on",
    "to",
    "of",
    "is",
    "this",
    "that",
    "role",
    "developer",
    "engineer",
  ]);

  const candidates = parts
    .map((p) => p.replace(/^.*?(?=\w)/, ""))
    .map((p) => p.replace(/[^\w\s.+#-]/g, " "))
    .map((p) => p.trim())
    .filter((p) => p.length >= 2)
    .filter((p) => !stopwords.has(p.toLowerCase()));

  const unique = Array.from(new Set(candidates.map((c) => c))).filter(Boolean);
  if (unique.length > 0) return unique.map((u) => u);

  const words = job
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.\-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));
  const unigrams = Array.from(new Set(words));
  const bigrams = Array.from(
    new Set(words.map((w, i) => (i + 1 < words.length ? `${w} ${words[i + 1]}` : "")).filter(Boolean)),
  );
  return Array.from(new Set([...bigrams, ...unigrams])).slice(0, 30);
}

function validateJobDescription(job: string): { valid: boolean; reason?: string } {
  const trimmed = (job || "").trim();

  if (trimmed.length < 50) {
    return { valid: false, reason: "❌ Job description too short. Minimum 50 characters required." };
  }

  const lowerJob = trimmed.toLowerCase();
  const wordCount = trimmed.split(/\s+/).length;

  if (
    lowerJob.includes("this is just a test") ||
    lowerJob.includes("this is just test") ||
    lowerJob === "test" ||
    lowerJob.match(/^(just|this|hello)\s+(is\s+)?(a\s+)?test/) ||
    (wordCount < 8 && lowerJob.includes("test"))
  ) {
    return { valid: false, reason: "❌ This appears to be a test input. Please provide a real job posting." };
  }

  const mustHaveKeywords = [
    "role",
    "position",
    "job",
    "developer",
    "engineer",
    "architect",
    "manager",
    "senior",
    "junior",
    "require",
    "skill",
    "experience",
    "qualification",
  ];

  const hasRealJobKeyword = mustHaveKeywords.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(trimmed));

  if (!hasRealJobKeyword) {
    return { valid: false, reason: "❌ Job description must include keywords like: role, position, skills, experience, require, etc." };
  }

  if (wordCount < 15) {
    return { valid: false, reason: "❌ Job description too brief. Provide at least 15 words with role, responsibilities, and skills." };
  }

  // Reject inputs with too few alphabetic characters (e.g., "hh" or single chars)
  const alphaCount = (trimmed.match(/[A-Za-z]/g) || []).length;
  if (alphaCount < 10) {
    return { valid: false, reason: "❌ Job description appears trivial. Provide a real, detailed job posting." };
  }

  // Reject if the text is mostly repeated characters or tokens
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const uniqueTokens = new Set(tokens.map((t) => t.toLowerCase()));
  if (uniqueTokens.size < Math.min(5, Math.max(1, Math.floor(tokens.length / 2)))) {
    return { valid: false, reason: "❌ Job description lacks substance or variety. Add more role details and skills." };
  }

  const uniqueWords = new Set(trimmed.toLowerCase().split(/\s+/));
  if (uniqueWords.size < 10) {
    return { valid: false, reason: "❌ Job description lacks variety. Include diverse keywords about role, skills, and experience." };
  }

  return { valid: true };
}

async function analyzeWithAI(cvPdfBytes: Buffer, job: string): Promise<AnalyzeResult | { error: string }> {
  try {
    console.log("[AI Service] Starting analysis...");

    const systemPrompt = `You are a strict CV evaluator. Follow these rules:

1. VALIDATION FIRST:
   - If the job description is vague, too short, or not a real job description, return: {"error": "Invalid job description"}
   - Only proceed if job description clearly shows: role, key responsibilities, or required skills

2. JOB SKILL EXTRACTION:
   - Extract ONLY explicit skills from the job description
   - Do NOT invent or infer skills
   - Look for: programming languages, frameworks, tools, certifications, soft skills

3. CV SKILL MATCHING:
  - Read the attached PDF CV directly
  - Find exact or similar matches in the CV content
   - Do NOT guess or assume skills the candidate has
   - Be conservative and realistic

4. SCORING:
   - score = (matched skills / total job required skills) * 100
   - Round to nearest integer

5. RESPONSE FORMAT:
   Return ONLY valid JSON with these keys:
   {
     "score": number,
     "skills_match": array of matched skills,
     "missing_skills": array of required but missing skills,
     "explanation": brief explanation
   }

   OR if invalid:
   {
     "error": "error message"
   }

NO explanations. NO markdown. ONLY JSON.`;

    const userPrompt = `Job Description:\n${job}\n\nAnalyze the attached PDF CV and return ONLY JSON.`;

    const model = geminiClient.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    console.log("[AI Service] Calling Gemini with model:", process.env.GEMINI_MODEL || "gemini-2.5-flash");
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: fullPrompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: cvPdfBytes.toString("base64"),
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    });

    const content = result.response.text().trim() || "{}";
    console.log("[AI Service] Raw response:", content);

    let data: any;
    try {
      data = JSON.parse(content);
    } catch (parseErr) {
      console.error("[AI Service] JSON parse error:", parseErr);
      return { error: "AI returned invalid JSON response" };
    }

    if (data.error) {
      console.log("[AI Service] AI validation rejected:", data.error);
      return { error: data.error };
    }

    if (typeof data.score !== "number" || !Array.isArray(data.skills_match) || !Array.isArray(data.missing_skills)) {
      console.error("[AI Service] Invalid response structure:", data);
      return { error: "AI response structure invalid" };
    }

    console.log(`[AI Service] Analysis complete: ${data.score}% match, ${data.skills_match.length} matched skills`);

    return {
      score: Math.max(0, Math.min(100, Math.round(data.score))),
      skills_match: Array.from(new Set((data.skills_match || []) as string[])).sort(),
      missing_skills: Array.from(new Set((data.missing_skills || []) as string[])).sort(),
      explanation: String(data.explanation || ""),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected AI service error";
    console.error("[AI Service] Error:", message);
    console.error("[AI Service] Full error:", err);
    throw err;
  }
}

app.post("/analyze", upload.single("cv"), async (req: Request, res: Response) => {
  try {
    console.log("[Route /analyze] ===== REQUEST RECEIVED =====");
    console.log("[Route /analyze] req.file exists:", !!req.file);
    console.log("[Route /analyze] req.body:", JSON.stringify(req.body));
    console.log("[Route /analyze] req.headers:", JSON.stringify(req.headers, null, 2));
    
    if (!req.file?.originalname) {
      console.warn("[Route /analyze] CV file missing");
      console.log("[Route /analyze] req.files:", req.files);
      return res.status(400).json({ error: "CV file is required" });
    }

    console.log(`[Route /analyze] File received: ${req.file.originalname}, size: ${req.file.buffer?.length || 0} bytes`);

    if (!process.env.AI_API_KEY) {
      console.error("[Route /analyze] AI_API_KEY missing");
      return res.status(500).json({ error: "AI_API_KEY is missing from server environment" });
    }

    const job = String(req.body?.job || "").trim();
    console.log("[Route /analyze] Job description length:", job.length);
    console.log("[Route /analyze] Job description (first 200 chars):", job.substring(0, 200));
    
    if (!job) {
      console.warn("[Route /analyze] Job description missing");
      return res.status(400).json({ error: "Job description is required" });
    }


    const validation = validateJobDescription(job);
    if (!validation.valid) {
      console.warn(`[Route /analyze] ❌ Job validation REJECTED: ${validation.reason}`);
      return res.status(400).json({ error: validation.reason || "Invalid job description" });
    }

    console.log(`[Route /analyze] ✓ Job description validated (${job.split(" ").length} words)`);
    console.log(`[Route /analyze] Sending PDF directly to Gemini: ${req.file.originalname}`);

    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.warn("[Route /analyze] PDF buffer is empty");
      return res.status(400).json({ error: "Invalid PDF file" });
    }

    console.log("[Route /analyze] Calling AI analysis service...");
    const result = await analyzeWithAI(req.file.buffer, job);

    if ("error" in result) {
      console.warn(`[Route /analyze] ❌ AI validation error: ${result.error}`);
      return res.status(400).json({ error: result.error });
    }

    // Database persistence intentionally disabled in this build
    console.log("[Route /analyze] Skipping database persistence (not configured)");

    console.log(`[Route /analyze] ✓ Success: ${result.score}% match`);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    console.error("[Route /analyze] ✗ Error:", message);
    return res.status(500).json({ error: message });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(port || 5000, () => {
    console.log(`\n🚀 Server running on http://localhost:${port || 5000}\n`);
  });
}

export default app;
