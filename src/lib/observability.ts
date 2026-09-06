/**
 * Structured logging + in-process metrics (docs/TODOS.md 10.6/10.7). One
 * JSON line per widget request (grep/query-friendly in any log aggregator)
 * plus a small in-memory rolling window of render timings for a perf-budget
 * snapshot. Like the rate limiter and in-memory cache tier, metrics are
 * per-instance and reset on cold start — fine for the "is this deployment
 * currently healthy" question this is meant to answer, not a substitute for
 * a real metrics backend at high volume.
 */

export interface WidgetLogFields {
  type: string;
  format: string;
  status: number;
  durationMs: number;
  dataCacheHit: boolean;
  renderCacheHit?: boolean;
  error?: string;
}

export function logWidgetRequest(fields: WidgetLogFields): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event: "widget_request", ...fields }));
  recordMetric(fields);
}

const MAX_SAMPLES = 500;

interface Counters {
  requestsTotal: number;
  dataCacheHits: number;
  dataCacheMisses: number;
  upstreamErrors: number;
  byType: Record<string, number>;
  /** Last MAX_SAMPLES render durations, oldest first — enough for a rough p50/p95. */
  durationsMs: number[];
}

const counters: Counters = {
  requestsTotal: 0,
  dataCacheHits: 0,
  dataCacheMisses: 0,
  upstreamErrors: 0,
  byType: {},
  durationsMs: [],
};

function recordMetric(fields: WidgetLogFields): void {
  counters.requestsTotal += 1;
  counters.byType[fields.type] = (counters.byType[fields.type] ?? 0) + 1;
  if (fields.dataCacheHit) counters.dataCacheHits += 1;
  else counters.dataCacheMisses += 1;
  if (fields.status >= 500) counters.upstreamErrors += 1;

  counters.durationsMs.push(fields.durationMs);
  if (counters.durationsMs.length > MAX_SAMPLES) counters.durationsMs.shift();
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[index];
}

export interface MetricsSnapshot {
  requestsTotal: number;
  dataCacheHitRate: number;
  upstreamErrorRate: number;
  byType: Record<string, number>;
  renderDurationMs: { p50: number; p95: number; max: number; sampleCount: number };
}

/** A point-in-time summary — see the /api/internal/metrics route for how it's exposed. */
export function getMetricsSnapshot(): MetricsSnapshot {
  const sorted = [...counters.durationsMs].sort((a, b) => a - b);
  const cacheableTotal = counters.dataCacheHits + counters.dataCacheMisses;

  return {
    requestsTotal: counters.requestsTotal,
    dataCacheHitRate: cacheableTotal > 0 ? counters.dataCacheHits / cacheableTotal : 0,
    upstreamErrorRate: counters.requestsTotal > 0 ? counters.upstreamErrors / counters.requestsTotal : 0,
    byType: { ...counters.byType },
    renderDurationMs: {
      p50: percentile(sorted, 50),
      p95: percentile(sorted, 95),
      max: sorted.length > 0 ? sorted[sorted.length - 1] : 0,
      sampleCount: sorted.length,
    },
  };
}
