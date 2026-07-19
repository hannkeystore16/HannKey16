import { openai, IMAGE_MODEL } from "./openaiClient";

export type ImageSize = "1024x1024" | "1536x1024" | "1024x1536";

interface GenerateImageOptions {
  prompt: string;
  size?: ImageSize;
  background?: "auto" | "transparent" | "opaque";
}

interface GeneratedImage {
  b64Json: string;
  mediaType: string;
}

/** Generates one image via gpt-image-1 through Replit's AI Integrations proxy. */
export async function generateImageAsset({
  prompt,
  size = "1024x1024",
  background = "auto",
}: GenerateImageOptions): Promise<GeneratedImage> {
  const response = await openai.images.generate({
    model: IMAGE_MODEL,
    prompt,
    size,
    quality: "medium",
    n: 1,
    ...(background !== "auto" ? { background } : {}),
  });

  const first = response.data?.[0];
  if (!first?.b64_json) {
    throw new Error("Image generation returned no image data.");
  }

  return {
    b64Json: first.b64_json,
    mediaType: "image/png",
  };
}
