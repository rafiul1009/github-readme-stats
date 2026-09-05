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
  const dataCacheKey = `${type}:${username}`;

  try {
    const data = await getOrSetAsync(githubDataCache, dataCacheKey, DATA_CACHE_TTL_MS, () =>
      widget.fetchData(options)
    );

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
