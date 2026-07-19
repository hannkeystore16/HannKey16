import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod/v4";
import { generateImageAsset, type ImageSize } from "../../lib/imageGen";

const router: IRouter = Router();

// Image generation is meaningfully more expensive than a text completion, so
// it gets a much tighter limit than the chat/text endpoints.
const imageRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Batas pembuatan gambar tercapai. Silakan coba lagi dalam satu jam." },
});

const CATEGORIES = [
  "logo",
  "banner",
  "illustration",
  "social",
  "uiux",
  "website",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_CONFIG: Record<Category, { size: ImageSize; background: "auto" | "transparent"; promptPrefix: string }> = {
  logo: {
    size: "1024x1024",
    background: "transparent",
    promptPrefix:
      "A clean, professional, modern logo mark, flat vector style, centered composition, no text, no letters, no watermark, transparent background, for:",
  },
  banner: {
    size: "1536x1024",
    background: "auto",
    promptPrefix:
      "A polished promotional banner graphic for a digital agency client, wide 3:2 composition, bold and modern, no readable body text (headline text may be implied but keep it minimal), for:",
  },
  illustration: {
    size: "1024x1024",
    background: "auto",
    promptPrefix: "A modern, clean digital illustration to accompany a blog article, no text, for:",
  },
  social: {
    size: "1024x1024",
    background: "auto",
    promptPrefix: "A scroll-stopping social media post graphic, square composition, vibrant and on-brand, minimal or no text, for:",
  },
  uiux: {
    size: "1536x1024",
    background: "auto",
    promptPrefix:
      "A clean UI/UX wireframe-style mockup of a website or app screen shown on a laptop or phone frame, modern flat design, no readable body text, for:",
  },
  website: {
    size: "1536x1024",
    background: "auto",
    promptPrefix:
      "A realistic browser-window mockup preview of a modern website homepage design, wide 3:2 composition, clean layout, no readable body text, for:",
  },
};

const requestSchema = z.object({
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(3).max(400),
});

router.post("/ai/image", imageRateLimit, async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request.", details: parsed.error.flatten() });
    return;
  }

  const { category, description } = parsed.data;
  const config = CATEGORY_CONFIG[category];
  const prompt = `${config.promptPrefix} ${description}`;

  try {
    const image = await generateImageAsset({
      prompt,
      size: config.size,
      background: config.background,
    });
    res.json({ b64Json: image.b64Json, mediaType: image.mediaType });
  } catch (err) {
    req.log?.error({ err }, "Image generation failed");
    res.status(502).json({ error: "Gagal membuat gambar. Silakan coba lagi." });
  }
});

export default router;
