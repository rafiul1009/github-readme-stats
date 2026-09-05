import { getWidget } from "@/widgets/registry";
import { parseOptions, normalizeOptionsForCacheKey, OptionValidationError } from "@/lib/options";
import { svgResponse, jsonResponse, errorResponse } from "@/lib/render/svg";
import { getOrSetAsync, githubDataCache, renderedOutputCache } from "@/lib/cache";

const DATA_CACHE_TTL_MS = 30 * 60 * 1000;

/**
 * Shared entry point for every widget-serving route: the generic
 * `/api/widget/[type]` dispatcher and the back-compat streak aliases all
 * call this. One place parses options, enforces the username/token
 * preconditions, drives the two-tier cache, and shapes the response.
 */
export async function handleWidgetRequest(
  type: string,
  searchParams: URLSearchParams
): Promise<Response> {
  const widget = getWidget(type);
  if (!widget) {
    return errorResponse(`Unknown widget type "${type}"`, 404);
  }

  let options: Record<string, unknown>;
  try {
    options = parseOptions(widget.schema, searchParams) as unknown as Record<string, unknown>;
  } catch (error) {
    if (error instanceof OptionValidationError) {
      return errorResponse(error.message, 400);
    }
    throw error;
  }

  const username = options.username as string | undefined;
  if (!username) {
    return errorResponse("username parameter is required", 400);
  }

  if (!process.env.GITHUB_TOKEN) {
    return errorResponse("GitHub token is not configured", 500);
  }

  const cacheSeconds = (options.cache_seconds as number | undefined) ?? widget.cacheSecondsDefault;
  const format = (options.format as string | undefined) ?? "svg";
  const suffix = widget.dataCacheKeySuffix?.(options);
  const dataCacheKey = suffix ? `${type}:${username}:${suffix}` : `${type}:${username}`;

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

    return svgResponse(svg, cacheSeconds);
  } catch (error) {
    console.error(`Error rendering widget "${type}":`, error);
    return errorResponse(`Failed to render ${type} widget`, 500);
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
    return errorResponse(`Unknown widget type "${type}"`, 404);
  }

  if (!widget.mockRawData) {
    return errorResponse(`Widget "${type}" has no preview data available`, 501);
  }

  let options: Record<string, unknown>;
  try {
    options = parseOptions(widget.schema, searchParams) as unknown as Record<string, unknown>;
  } catch (error) {
    if (error instanceof OptionValidationError) {
      return errorResponse(error.message, 400);
    }
    throw error;
  }

  const format = (options.format as string | undefined) ?? "svg";

  try {
    const raw = widget.mockRawData(options);
    const data = widget.computeData(raw, options);

    if (format === "json") {
      return jsonResponse(widget.toJson(data, options), 0);
    }

    const svg = widget.renderSvg(data, options);
    return new Response(svg, {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(`Error rendering preview for widget "${type}":`, error);
    return errorResponse(`Failed to render ${type} preview`, 500);
  }
}
