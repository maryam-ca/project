import { headers } from "next/headers";

// Simple in-memory limiter (single instance). Production mein Redis/Upstash use karein.
const hits = new Map<string, number[]>();

export async function rateLimit(key: string, max: number, windowMs: number) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const k = `${key}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(k) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(k, recent);
    return false;
  }
  recent.push(now);
  hits.set(k, recent);
  return true;
}
