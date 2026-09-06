import { WidgetRenderError } from "@/widgets/errors";

/**
 * Fetches a GitHub avatar and base64-embeds it as a data URI (docs/TODOS.md
 * 7.4) so the rendered SVG has no external image reference (README
 * renderers proxy/cache `<img>` content through camo, which can't reach
 * into an `<svg><image>` the way it can an `<img src>`). `sizePx` is passed
 * through to GitHub's own avatar resizing (`?s=`), so no local image
 * processing library is needed — GitHub already serves the requested
 * resolution directly.
 */
export async function fetchAvatarDataUri(avatarUrl: string, sizePx: number): Promise<string> {
  const url = new URL(avatarUrl);
  url.searchParams.set("s", String(sizePx));

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new WidgetRenderError(`Failed to fetch avatar: ${message}`, 502);
  }

  if (!response.ok) {
    throw new WidgetRenderError(`Failed to fetch avatar: GitHub returned ${response.status}`, 502);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const bytes = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${bytes.toString("base64")}`;
}
