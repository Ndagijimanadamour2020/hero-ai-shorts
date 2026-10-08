import { z } from "zod";
export const JobStatus = z.enum(["queued","generating_script","generating_audio","rendering","completed","failed"]);
export const JobSchema = z.object({
  id: z.string(),
  topic: z.string(),
  status: JobStatus,
  progress: z.number().min(0).max(100),
  plan: z.any().optional(),
  outputUrl: z.string().optional(),
  error: z.string().optional(),
  createdAt: z.string()
});
export type Job = z.infer<typeof JobSchema>;
