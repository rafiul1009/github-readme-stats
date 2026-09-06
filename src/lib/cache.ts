/**
 * Two-tier cache (docs/PLAN.md §6): a raw-data cache for GitHub API
 * responses, and a rendered-output cache keyed by a widget's full
 * normalized option set. Both are module-level Maps, which means the
 * cache does NOT survive serverless cold starts or spread across
 * concurrent instances — a known limitation (see docs/PLAN.md §8), with a
 * documented upgrade path to Vercel KV/Redis (docs/TODOS.md Phase 10.1).
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class TtlCache<T> {
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

const DATA_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_RENDER_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Raw GitHub API responses, keyed by widget type + username (+ any data-affecting options). */
export const githubDataCache = new TtlCache<unknown>(DATA_CACHE_TTL_MS);

/** Rendered SVG/JSON output, keyed by widget type + the full normalized option set. */
export const renderedOutputCache = new TtlCache<string>(DEFAULT_RENDER_CACHE_TTL_MS);

/** Rasterized PNG output (task 5.8), keyed the same way plus a `:png` suffix — separate from the SVG cache since it holds Buffers, not strings. */
export const renderedPngCache = new TtlCache<Buffer>(DEFAULT_RENDER_CACHE_TTL_MS);

/** Fetches `key` from `cache`, computing and storing it via `compute` on a miss. */
export async function getOrSetAsync<T>(
  cache: TtlCache<T>,
  key: string,
  ttlMs: number,
  compute: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const value = await compute();
  cache.set(key, value, ttlMs);
  return value;
}
