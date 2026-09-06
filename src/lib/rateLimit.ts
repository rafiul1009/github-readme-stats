/**
 * Per-IP token bucket (docs/TODOS.md 10.5) — throttles uncached renders
 * only (the handler checks this after a data-cache miss is already known,
 * so a cache hit never counts against the limit). In-memory, per-instance:
 * the same documented limitation as the TtlCache tier of src/lib/cache.ts
 * (doesn't survive cold starts or spread across concurrent instances), but
 * that's an acceptable tradeoff for abuse mitigation — a determined abuser
 * spread across many instances is a job for edge/WAF-level rate limiting,
 * not this. This stops the common case: one IP hammering uncached widget
 * renders and burning through the GitHub token pool's rate limit.
 */

interface Bucket {
  tokens: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT = 30;
const WINDOW_MS = 60_000;
const SWEEP_INTERVAL = 500;
let checksSinceSweep = 0;

function limitFromEnv(): number {
  const raw = process.env.RATE_LIMIT_PER_MINUTE;
  if (!raw) return DEFAULT_LIMIT;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LIMIT;
}

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > WINDOW_MS) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller should retry — only meaningful when `allowed` is false. */
  retryAfterSeconds: number;
}

/** Set RATE_LIMIT_PER_MINUTE=0 (or any non-positive value falls back to the default) to disable — there's no separate on/off flag. */
export function checkRateLimit(ip: string): RateLimitResult {
  const limit = limitFromEnv();
  const now = Date.now();

  checksSinceSweep += 1;
  if (checksSinceSweep >= SWEEP_INTERVAL) {
    checksSinceSweep = 0;
    sweep(now);
  }

  const bucket = buckets.get(ip);
  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(ip, { tokens: limit - 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000));
  return { allowed: false, retryAfterSeconds };
}

/** Best-effort client IP from standard proxy headers — the same header Vercel and most reverse proxies set. */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
