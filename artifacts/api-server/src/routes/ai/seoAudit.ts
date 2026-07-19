import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod/v4";
import { openai, CHAT_MODEL } from "../../lib/openaiClient";
import { safeFetchHtml } from "../../lib/urlSafety";
import { analyzeHtml, type SeoFindings } from "../../lib/seoAnalyze";

const router: IRouter = Router();

const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a few minutes and try again." },
});

const requestSchema = z.object({
  url: z.string().trim().min(4).max(500),
});

const SYSTEM_PROMPT = `You are the Website Audit & SEO tool inside HANNKEY16's AI Menu. You are given a list of automated on-page checks for a visitor's website. Turn them into a short, plain-language, prioritized report a non-technical business owner can understand.

Respond with ONLY a single JSON object (no markdown fences) matching exactly this shape:
{
  "summary": string, // 1-2 sentence overall verdict
  "recommendations": [ { "priority": "high" | "medium" | "low", "text": string } ] // 3 to 6 concrete, actionable recommendations, ordered by priority
}

Reply in Bahasa Indonesia unless the findings clearly suggest an English-speaking audience. Keep every string short and non-technical where possible.`;

router.post("/ai/seo-audit", rateLimitMiddleware, async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request.", details: parsed.error.flatten() });
    return;
  }

  let normalizedUrl = parsed.data.url;
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let findings: SeoFindings;
  let finalUrl: string;
  try {
    const page = await safeFetchHtml(normalizedUrl);
    finalUrl = page.finalUrl;
    findings = analyzeHtml(page.html, page.fetchTimeMs);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal mengambil halaman.";
    res.status(400).json({ error: message });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(findings.checks) },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const report = parseReport(raw);

    res.json({
      url: finalUrl,
      checks: findings.checks,
      summary: report?.summary ?? null,
      recommendations: report?.recommendations ?? [],
    });
  } catch (err) {
    req.log?.error({ err }, "SEO audit AI synthesis failed");
    // The raw checks are still useful even if the AI summary fails.
    res.json({ url: finalUrl, checks: findings.checks, summary: null, recommendations: [] });
  }
});

interface AuditReport {
  summary: string;
  recommendations: Array<{ priority: "high" | "medium" | "low"; text: string }>;
}

function parseReport(raw: string): AuditReport | null {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const data = JSON.parse(cleaned) as Partial<AuditReport>;
    if (typeof data.summary === "string" && Array.isArray(data.recommendations)) {
      return {
        summary: data.summary,
        recommendations: data.recommendations
          .filter(
            (r): r is AuditReport["recommendations"][number] =>
              !!r &&
              typeof r.text === "string" &&
              (r.priority === "high" || r.priority === "medium" || r.priority === "low"),
          )
          .slice(0, 6),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default router;
