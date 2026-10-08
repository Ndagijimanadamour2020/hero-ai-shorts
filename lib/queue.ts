import { randomUUID } from "node:crypto";
import type { Job } from "./job-schema";

const jobs = new Map<string, Job>();

export function createJob(topic: string): Job {
  const job: Job = {
    id: randomUUID(), topic, status: "queued", progress: 0,
    createdAt: new Date().toISOString()
  };
  jobs.set(job.id, job);
  return job;
}
export function getJob(id: string) { return jobs.get(id); }
export function updateJob(id: string, patch: Partial<Job>) {
  const job = jobs.get(id); if (!job) return;
  jobs.set(id, {...job, ...patch});
  return jobs.get(id);
}
