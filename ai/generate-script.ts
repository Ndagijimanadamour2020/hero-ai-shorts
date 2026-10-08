import { generateObject } from "ai";
import { VideoPlanSchema, type VideoPlan } from "@/lib/schemas";
import { SYSTEM_PROMPT } from "./prompts";

export async function generateVideoPlan(topic: string): Promise<VideoPlan> {
  const result = await generateObject({
    model: process.env.AI_MODEL || "openai/gpt-5.5",
    schema: VideoPlanSchema,
    system: SYSTEM_PROMPT,
    prompt: `Create a 35-55 second YouTube Short about: ${topic}`
  });
  return result.object;
}
