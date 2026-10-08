import { z } from "zod";

export const SceneSchema = z.object({
  id: z.string(), start: z.number().nonnegative(), duration: z.number().positive(),
  narration: z.string().min(1), headline: z.string().min(1), subheadline: z.string().optional(),
  visualType: z.enum(["title","text","stat","quote","list","cta","image"]),
  visualPrompt: z.string().optional(), visualData: z.record(z.string(), z.unknown()).default({}),
  caption: z.string().optional()
});
export const VideoPlanSchema = z.object({
  title: z.string(), hook: z.string(), description: z.string(), duration: z.number().min(15).max(90),
  language: z.string().default("en"), scenes: z.array(SceneSchema).min(2),
  hashtags: z.array(z.string()).default([]), voiceTone: z.enum(["energetic","professional","friendly","dramatic","calm"])
});
export type VideoPlan = z.infer<typeof VideoPlanSchema>;
export type Scene = z.infer<typeof SceneSchema>;
