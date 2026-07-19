import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod/v4";
import { openai, CHAT_MODEL } from "../../lib/openaiClient";

const router: IRouter = Router();

const rateLimitMiddleware = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a few minutes and try again." },
});

const CONTENT_TYPES = [
  "social_caption",
  "product_description",
  "short_article",
  "ad_copy",
] as const;

type ContentType = (typeof CONTENT_TYPES)[number];

const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  social_caption: "a social media caption (with a few relevant hashtags)",
  product_description: "a persuasive product/service description",
  short_article: "a short article or blog intro (3-4 short paragraphs)",
  ad_copy: "a short paid-ad style copy with a strong call to action",
};

const requestSchema = z.object({
  contentType: z.enum(CONTENT_TYPES),
  context: z.string().trim().min(5).max(500),
  tone: z.string().trim().max(60).optional(),
});

const SYSTEM_PROMPT = `You are the Copywriting AI inside HANNKEY16's AI Menu, writing ready-to-use marketing copy for the visitor's own business. Write only the requested copy itself — no preamble, no explanations, no markdown headers. Reply in the same language as the visitor's input (Bahasa Indonesia or English). Keep it tight and usable as-is.`;

router.post("/ai/copywriting", rateLimitMiddleware, async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request.", details: parsed.error.flatten() });
    return;
  }

  const { contentType, context, tone } = parsed.data;
  const userPrompt = `Write ${CONTENT_TYPE_LABEL[contentType]}.${
    tone ? ` Tone: ${tone}.` : ""
  }\n\nContext about the business/product: ${context}`;

  try {
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      res.status(502).json({ error: "Failed to generate copy. Please try again." });
      return;
    }

    res.json({ text });
  } catch (err) {
    req.log?.error({ err }, "Copywriting generation failed");
    res.status(502).json({ error: "Failed to generate copy. Please try again." });
  }
});

export default router;
