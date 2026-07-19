// All AI Menu tools run through Replit's managed AI Integrations proxy for
// OpenAI — no user-provided API key required, billed to Replit credits.
export { openai } from "@workspace/integrations-openai-ai-server";

// Cost-effective general-purpose model; good fit for a public-facing chat
// widget and short text-generation tools.
export const CHAT_MODEL = "gpt-5.4-mini";

export const IMAGE_MODEL = "gpt-image-1";
