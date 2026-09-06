import { NextRequest } from "next/server";
import { getIcon } from "@/lib/icons";
import { renderSvgToPng } from "@/lib/render/png";

/**
 * Single bundled tech icon (docs/TODOS.md 8.6): `/api/widget/icon/<name>`,
 * where `<name>` is a simple-icons slug (see https://simpleicons.org). Not
 * a registered widget — no theme/username/caching machinery applies, it's
 * a stateless function of the path + a couple of query params.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  const { searchParams } = new URL(request.url);

  const icon = getIcon(name);
  if (!icon) {
    return new Response(`Unknown icon "${name}" — see https://simpleicons.org for valid slugs.`, { status: 404 });
  }

  const size = Math.min(Math.max(parseInt(searchParams.get("size") || "48", 10) || 48, 8), 512);
  const rawColor = searchParams.get("color");
  const color = rawColor ? (rawColor.startsWith("#") ? rawColor : `#${rawColor}`) : `#${icon.hex}`;
  const format = searchParams.get("format") === "png" ? "png" : "svg";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}"><path d="${icon.path}" fill="${color}"/></svg>`;

  if (format === "png") {
    const png = await renderSvgToPng(svg);
    return new Response(new Uint8Array(png), {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
    });
  }

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
