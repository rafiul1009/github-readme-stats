import { NextRequest } from "next/server";
import { getMetricsSnapshot } from "@/lib/observability";
import { hasDurableCache } from "@/lib/cache";
import { githubTokenPoolSize } from "@/lib/githubAuth";

/**
 * Observability snapshot (docs/TODOS.md 10.6/10.7) — cache hit rate,
 * upstream error rate, per-widget-type request counts, and a rough
 * render-time p50/p95/max, plus which optional hardening features are
 * actually active in this deployment. Gated by METRICS_TOKEN so it isn't
 * wide open on a public deployment; unset METRICS_TOKEN disables the
 * endpoint entirely (404) rather than defaulting to open.
 */
export async function GET(request: NextRequest) {
  const requiredToken = process.env.METRICS_TOKEN;
  if (!requiredToken) {
    return new Response("Not found", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== requiredToken) {
    return new Response("Not found", { status: 404 });
  }

  const snapshot = getMetricsSnapshot();
  return new Response(
    JSON.stringify({
      ...snapshot,
      durableCache: hasDurableCache(),
      githubTokenPoolSize: githubTokenPoolSize(),
    }),
    { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
  );
}
