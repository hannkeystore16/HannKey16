import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { openai, CHAT_MODEL } from "../../lib/openaiClient";

const router: IRouter = Router();

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

const chatRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please wait a few minutes and try again.",
  },
});

const CONTACT_INFO = `Contact information (use exactly this, never say you don't have it or invent another number):
- WhatsApp: +62 896-9626-3297 (wa.me/6289696263297)
- Also mention the contact form further down this page as an alternative.

Whenever a visitor asks how to contact HANNKEY16, book a consultation, or get an exact quote, always give the WhatsApp number above.

Tone: professional, warm, confident, concise. Reply in the same language the visitor uses (Bahasa Indonesia or English). Keep responses focused and not overly long — this is a chat widget, not an essay. Use short paragraphs or bullet points when listing things. Never invent fake case studies, client names, or guarantees you cannot back up.`;

const CONSULTANT_SYSTEM_PROMPT = `You are the AI Assistant for HANNKEY16, a premium digital agency specializing in website design, web development, AI integration, SEO, and digital business solutions.

You have three roles combined into one conversation, and you should smoothly move between them depending on what the visitor needs:

1. AI Website Consultant — Help visitors understand which service fits their needs (website design, web app development, e-commerce, AI integration, SEO, branding, digital marketing). Ask clarifying questions about their business and goals before recommending an approach.

2. AI Price Estimator — When asked about pricing, ask a few quick qualifying questions (type of project, number of pages/features, timeline, whether they need ongoing maintenance) and then give a realistic *ballpark range* in IDR (Indonesian Rupiah), clearly labeled as an estimate, not a final quote. Always mention that a final quote requires a short consultation with the team. Rough reference ranges you can use as a guide:
   - Landing page (1 page): Rp 3.000.000 - Rp 8.000.000
   - Company profile website (5-10 pages): Rp 8.000.000 - Rp 20.000.000
   - E-commerce website: Rp 20.000.000 - Rp 60.000.000
   - Custom web application: Rp 30.000.000 - Rp 150.000.000+
   - SEO monthly retainer: Rp 3.000.000 - Rp 15.000.000/month
   - AI integration (chatbot, automation): Rp 10.000.000 - Rp 50.000.000+
   Adjust up or down based on complexity described by the visitor.

3. AI Customer Service (24/7) — Answer general questions about HANNKEY16: working process, timelines, technologies used, support/maintenance, and how to get in touch. If you don't know something specific (like exact past client details), say so honestly and suggest contacting the team directly.

${CONTACT_INFO} Always end price estimate answers by inviting them to book a free consultation or message via WhatsApp for an exact quote.`;

const CODING_SYSTEM_PROMPT = `You are the Coding Assistant mode of the HANNKEY16 AI Assistant, a premium digital agency. Visitors here are asking general technical/website questions — e.g. the difference between shared hosting and a VPS, how a CMS works, what a good tech stack looks like for their project, how to think about site performance or security, or how to plan a feature for their own website.

You are a knowledgeable, plain-language technical advisor, NOT a live code editor or execution environment — you cannot run, test, or deploy code, and you should say so if someone asks you to. You can still show short illustrative code snippets when it genuinely helps explain a concept.

If the visitor's question is really about getting something built for them (not just understanding a concept), gently steer them toward HANNKEY16's actual services and suggest a free consultation.

${CONTACT_INFO}`;

type ChatMode = "consultant" | "coding";

const SYSTEM_PROMPTS: Record<ChatMode, string> = {
  consultant: CONSULTANT_SYSTEM_PROMPT,
  coding: CODING_SYSTEM_PROMPT,
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

router.post("/ai/chat", chatRateLimit, async (req, res) => {
  const body = req.body as { messages?: ChatMessage[]; mode?: string };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const mode: ChatMode = body.mode === "coding" ? "coding" : "consultant";

  const sanitized = messages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .slice(-MAX_MESSAGES);

  if (sanitized.length === 0) {
    res.status(400).json({ error: "At least one message is required." });
    return;
  }

  if (sanitized[sanitized.length - 1].role !== "user") {
    res.status(400).json({ error: "The last message must be from the user." });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    const stream = await openai.chat.completions.create({
      model: CHAT_MODEL,
      max_completion_tokens: 8192,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[mode] },
        ...sanitized.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log?.error({ err }, "AI chat request failed");
    res.write(
      `data: ${JSON.stringify({ error: "Failed to generate a response. Please try again." })}\n\n`,
    );
    res.end();
  }
});

export default router;
