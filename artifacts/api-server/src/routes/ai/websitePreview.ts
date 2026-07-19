import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod/v4";
import { openai, CHAT_MODEL } from "../../lib/openaiClient";

const router: IRouter = Router();

const rateLimitMiddleware = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a few minutes and try again." },
});

const requestSchema = z.object({
  brief: z.string().trim().min(5).max(600),
});

const SYSTEM_PROMPT = `You are the Website Generator inside HANNKEY16's AI Menu. A visitor describes the website they want, and you turn it into a short, concrete concept they can react to — a demo of what HANNKEY16 could build for them, not a real deployable site.

Respond with ONLY a single JSON object (no markdown fences, no commentary) matching exactly this shape:
{
  "headline": string, // punchy hero headline, max ~8 words
  "subheadline": string, // one supporting sentence, max ~20 words
  "colorTheme": { "primary": string, "secondary": string, "accent": string }, // hex colors that fit the business vibe
  "toneWord": string, // one word describing the visual tone, e.g. "Modern", "Playful", "Elegant"
  "sections": [ { "title": string, "description": string } ] // 3 to 5 sections, e.g. Hero, About, Services, Gallery, Contact — description is one short sentence each
}

Reply in the same language as the visitor's brief (Bahasa Indonesia or English). Keep every string short — this renders in a small preview card, not a document. Never wrap the JSON in markdown code fences.`;

router.post("/ai/website-preview", rateLimitMiddleware, async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request.", details: parsed.error.flatten() });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: parsed.data.brief },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const concept = parseConcept(raw);
    if (!concept) {
      res.status(502).json({ error: "AI response could not be parsed. Please try again." });
      return;
    }

    res.json({ concept });
  } catch (err) {
    req.log?.error({ err }, "Website preview generation failed");
    res.status(502).json({ error: "Failed to generate a preview. Please try again." });
  }
});

interface WebsiteConcept {
  headline: string;
  subheadline: string;
  colorTheme: { primary: string; secondary: string; accent: string };
  toneWord: string;
  sections: Array<{ title: string; description: string }>;
}

function parseConcept(raw: string): WebsiteConcept | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    const data = JSON.parse(cleaned) as Partial<WebsiteConcept>;
    if (
      typeof data.headline === "string" &&
      typeof data.subheadline === "string" &&
      data.colorTheme &&
      typeof data.colorTheme.primary === "string" &&
      typeof data.colorTheme.secondary === "string" &&
      typeof data.colorTheme.accent === "string" &&
      typeof data.toneWord === "string" &&
      Array.isArray(data.sections) &&
      data.sections.every(
        (s) => s && typeof s.title === "string" && typeof s.description === "string",
      )
    ) {
      return {
        headline: data.headline,
        subheadline: data.subheadline,
        colorTheme: data.colorTheme,
        toneWord: data.toneWord,
        sections: data.sections.slice(0, 5),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default router;
