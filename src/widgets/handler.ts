import { getWidget } from "@/widgets/registry";
import { parseOptions, normalizeOptionsForCacheKey, OptionValidationError } from "@/lib/options";
import { svgResponse, jsonResponse, errorResponse, svgErrorResponse } from "@/lib/render/svg";
import { renderSvgToPng, pngResponse } from "@/lib/render/png";
import { getOrSetAsync, githubDataCache, renderedOutputCache, renderedPngCache } from "@/lib/cache";
import { WidgetRenderError } from "@/widgets/errors";

const DATA_CACHE_TTL_MS = 30 * 60 * 1000;

function wantsJson(searchParams: URLSearchParams): boolean {
  return searchParams.get("format") === "json";
}

function respondError(message: string, status: number, asJson: boolean): Response {
  return asJson ? errorResponse(message, status) : svgErrorResponse(message, status);
}

/**
 * Self-host access control (docs/TODOS.md 5.9): when `WHITELIST` is set, a
 * self-hosted instance serves only the listed usernames — useful for a
 * private/personal deployment that shouldn't act as a public proxy for
 * arbitrary GitHub accounts. Unset (the default) serves everyone. Only
 * enforced when an owning username is actually known: the pin widget's
 * `owner/repo` is checked by its owner segment, but the gist widget (keyed
 * by an opaque id with no owner available without an extra fetch) is not
 * restricted — a self-hoster who needs that guarantee should disable the
 * gist widget entirely rather than rely on partial enforcement here.
 */
function isWhitelisted(candidate: string | undefined): boolean {
  const raw = process.env.WHITELIST;
  if (!raw) return true;
  if (!candidate) return true;
  const allowed = raw
    .split(",")
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(candidate.toLowerCase());
}

/**
 * Shared entry point for every widget-serving route: the generic
 * `/api/widget/[type]` dispatcher and the back-compat streak aliases all
 * call this. One place parses options, enforces preconditions, drives the
 * two-tier cache, and shapes the response.
 */
export async function handleWidgetRequest(
  type: string,
  searchParams: URLSearchParams
): Promise<Response> {
  const widget = getWidget(type);
  if (!widget) {
    return respondError(`Unknown widget type "${type}"`, 404, wantsJson(searchParams));
  }

  let options: Record<string, unknown>;
  try {
    options = parseOptions(widget.schema, searchParams) as unknown as Record<string, unknown>;
  } catch (error) {
    if (error instanceof OptionValidationError) {
      return respondError(error.message, 400, wantsJson(searchParams));
    }
    throw error;
  }

  const format = (options.format as string | undefined) ?? "svg";
  const asJson = format === "json";
  // PNG rasterizes a single static frame (D3/5.8) — animations would just
  // freeze mid-fade, so force them off regardless of what was requested.
  if (format === "png") options.disable_animations = true;

  const username = options.username as string | undefined;
  if (widget.requiresUsername !== false && !username) {
    return respondError("username parameter is required", 400, asJson);
  }

  const repoOption = typeof options.repo === "string" ? options.repo : undefined;
  const whitelistSubject = username ?? repoOption?.split("/")[0];
  if (!isWhitelisted(whitelistSubject)) {
    return respondError("This deployment does not serve this username.", 403, asJson);
  }

  if (!process.env.GITHUB_TOKEN) {
    return respondError("GitHub token is not configured", 500, asJson);
  }

  const cacheKeyBase = widget.dataCacheKeyBase ? widget.dataCacheKeyBase(options) : username;
  if (!cacheKeyBase) {
    return respondError(`${type} widget requires an identifying parameter`, 400, asJson);
  }

  const cacheSeconds = (options.cache_seconds as number | undefined) ?? widget.cacheSecondsDefault;
  const suffix = widget.dataCacheKeySuffix?.(options);
  const dataCacheKey = suffix ? `${type}:${cacheKeyBase}:${suffix}` : `${type}:${cacheKeyBase}`;

  try {
    const raw = await getOrSetAsync(githubDataCache, dataCacheKey, DATA_CACHE_TTL_MS, () =>
      widget.fetchRawData(options)
    );
    const data = widget.computeData(raw, options);

    if (format === "json") {
      return jsonResponse(widget.toJson(data, options), cacheSeconds);
    }

    const outputCacheKey = `${type}:${normalizeOptionsForCacheKey(options)}`;
    const svg = await getOrSetAsync(renderedOutputCache, outputCacheKey, cacheSeconds * 1000, async () =>
      widget.renderSvg(data, options)
    );

    if (format === "png") {
      const png = await getOrSetAsync(renderedPngCache, outputCacheKey, cacheSeconds * 1000, async () =>
        renderSvgToPng(svg)
      );
      return pngResponse(png, cacheSeconds);
    }

    return svgResponse(svg, cacheSeconds);
  } catch (error) {
    console.error(`Error rendering widget "${type}":`, error);
    const message = error instanceof WidgetRenderError ? error.message : `Failed to render ${type} widget`;
    const status = error instanceof WidgetRenderError ? error.status : 500;
    return respondError(message, status, asJson);
  }
}

/**
 * Powers the builder's live preview: renders a widget from its bundled
 * mock data instead of calling GitHub, so editing options is instant and
 * free (docs/PLAN.md §5 — "preview from sample data" is what makes a
 * live-updating options form viable without burning rate limit). No
 * username or GITHUB_TOKEN required, and nothing is cached — mock renders
 * are already cheap.
 */
export async function handlePreviewRequest(type: string, searchParams: URLSearchParams): Promise<Response> {
  const widget = getWidget(type);
  if (!widget) {
    return respondError(`Unknown widget type "${type}"`, 404, wantsJson(searchParams));
  }

  if (!widget.mockRawData) {
    return respondError(`Widget "${type}" has no preview data available`, 501, wantsJson(searchParams));
  }

  let options: Record<string, unknown>;
  try {
    options = parseOptions(widget.schema, searchParams) as unknown as Record<string, unknown>;
  } catch (error) {
    if (error instanceof OptionValidationError) {
      return respondError(error.message, 400, wantsJson(searchParams));
    }
    throw error;
  }

  const format = (options.format as string | undefined) ?? "svg";
  const asJson = format === "json";
  if (format === "png") options.disable_animations = true;

  try {
    const raw = widget.mockRawData(options);
    const data = widget.computeData(raw, options);

    if (asJson) {
      return jsonResponse(widget.toJson(data, options), 0);
    }

    const svg = widget.renderSvg(data, options);

    if (format === "png") {
      const png = renderSvgToPng(svg);
      return new Response(new Uint8Array(png), {
        headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
      });
    }

    return new Response(svg, {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(`Error rendering preview for widget "${type}":`, error);
    const message = error instanceof WidgetRenderError ? error.message : `Failed to render ${type} preview`;
    const status = error instanceof WidgetRenderError ? error.status : 500;
    return respondError(message, status, asJson);
  }
}
