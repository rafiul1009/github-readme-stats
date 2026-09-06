/**
 * Two-tier cache (docs/PLAN.md §6): a raw-data cache for GitHub API
 * responses, and a rendered-output cache keyed by a widget's full
 * normalized option set.
 *
 * Each tier is backed by an in-memory Map (fast, but does NOT survive
 * serverless cold starts or spread across concurrent instances) plus an
 * optional durable layer (docs/TODOS.md 10.1): when `KV_REST_API_URL` /
 * `KV_REST_API_TOKEN` (Vercel KV) or `UPSTASH_REDIS_REST_URL` /
 * `UPSTASH_REDIS_REST_TOKEN` (Upstash directly — Vercel KV is Upstash
 * under the hood, so both speak the same plain-HTTP REST command API) are
 * configured, every read/write also goes through Redis, so a cache entry
 * survives cold starts and is shared across every instance/region. Unset
 * (the default), behavior is unchanged from before — in-memory only, zero
 * setup required.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/** get/set may be sync (in-memory) or async (durable) — `getOrSetAsync` awaits either transparently. */
interface CacheLike<T> {
  get(key: string): T | undefined | Promise<T | undefined>;
  set(key: string, data: T, ttlMs: number): void | Promise<void>;
  delete(key: string): void | Promise<void>;
}

export class TtlCache<T> implements CacheLike<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(private readonly defaultTtlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T, ttlMs: number = this.defaultTtlMs): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

function durableCacheCredentials(): { baseUrl: string; token: string } | undefined {
  const baseUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return baseUrl && token ? { baseUrl, token } : undefined;
}

/** Whether a durable cache backend is configured — surfaced for observability (docs/TODOS.md 10.6). */
export function hasDurableCache(): boolean {
  return durableCacheCredentials() !== undefined;
}

/**
 * In-memory L1 (always used, for same-instance repeat hits) plus an
 * optional Redis-backed L2 (docs/TODOS.md 10.1). Every durable operation is
 * best-effort: a network error or missing credentials just falls back to
 * memory-only behavior rather than failing the request — a widget render
 * should never break because the durable cache is slow or unreachable.
 */
class DurableCache<T> implements CacheLike<T> {
  constructor(
    private readonly prefix: string,
    private readonly memory: TtlCache<T>,
    private readonly serialize: (value: T) => string,
    private readonly deserialize: (raw: string) => T
  ) {}

  async get(key: string): Promise<T | undefined> {
    const memHit = this.memory.get(key);
    if (memHit !== undefined) return memHit;

    const creds = durableCacheCredentials();
    if (!creds) return undefined;

    try {
      const res = await fetch(`${creds.baseUrl}/get/${encodeURIComponent(this.prefix + key)}`, {
        headers: { authorization: `Bearer ${creds.token}` },
      });
      if (!res.ok) return undefined;
      const body = (await res.json()) as { result: string | null };
      if (body.result == null) return undefined;
      return this.deserialize(body.result);
    } catch {
      return undefined;
    }
  }

  async set(key: string, data: T, ttlMs: number): Promise<void> {
    this.memory.set(key, data, ttlMs);

    const creds = durableCacheCredentials();
    if (!creds) return;

    try {
      const seconds = Math.max(1, Math.round(ttlMs / 1000));
      const encodedValue = encodeURIComponent(this.serialize(data));
      await fetch(
        `${creds.baseUrl}/set/${encodeURIComponent(this.prefix + key)}/${encodedValue}/EX/${seconds}`,
        { headers: { authorization: `Bearer ${creds.token}` } }
      );
    } catch {
      // Best-effort — the in-memory write above already succeeded.
    }
  }

  delete(key: string): void {
    this.memory.delete(key);
  }
}

const DATA_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_RENDER_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Raw GitHub API responses, keyed by widget type + username (+ any data-affecting options). */
export const githubDataCache: CacheLike<unknown> = new DurableCache<unknown>(
  "gh:",
  new TtlCache<unknown>(DATA_CACHE_TTL_MS),
  (value) => JSON.stringify(value),
  (raw) => JSON.parse(raw) as unknown
);

/** Rendered SVG/JSON output, keyed by widget type + the full normalized option set. */
export const renderedOutputCache: CacheLike<string> = new DurableCache<string>(
  "out:",
  new TtlCache<string>(DEFAULT_RENDER_CACHE_TTL_MS),
  (value) => value,
  (raw) => raw
);

/** Rasterized PNG output (task 5.8), keyed the same way — separate from the SVG cache since it holds Buffers, not strings. */
export const renderedPngCache: CacheLike<Buffer> = new DurableCache<Buffer>(
  "png:",
  new TtlCache<Buffer>(DEFAULT_RENDER_CACHE_TTL_MS),
  (buf) => buf.toString("base64"),
  (raw) => Buffer.from(raw, "base64")
);

/** Fetches `key` from `cache`, computing and storing it via `compute` on a miss. */
export async function getOrSetAsync<T>(
  cache: CacheLike<T>,
  key: string,
  ttlMs: number,
  compute: () => Promise<T>
): Promise<T> {
  const cached = await cache.get(key);
  if (cached !== undefined) return cached;

  const value = await compute();
  await cache.set(key, value, ttlMs);
  return value;
}
