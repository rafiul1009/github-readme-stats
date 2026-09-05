import type { ReactElement } from "react";
// react-dom/server.edge (rather than the bare "react-dom/server" entry) sidesteps
// Next.js's app-router build check that otherwise flags any react-dom/server import
// reachable from src/app as "importing a component that imports react-dom/server" —
// it works correctly under the Node runtime too, not just edge.
import { renderToStaticMarkup } from "react-dom/server.edge";
import { ErrorCard } from "@/components/card/ErrorCard";

/**
 * Serializes a widget's root <svg> JSX element to an SVG document string
 * (docs/PLAN.md §7 D1 — TSX authored as real SVG elements, not Satori).
 * React already understands SVG element/attribute names (viewBox, cx, cy,
 * strokeWidth -> stroke-width, ...), so this is a thin wrapper. A widget's
 * own `renderSvg(data, options)` method calls this to produce its output.
 */
export function renderJsxToSvg(element: ReactElement): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${renderToStaticMarkup(element)}`;
}

export function svgResponse(svg: string, cacheSeconds: number): Response {
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": `public, max-age=${cacheSeconds}`,
    },
  });
}

export function jsonResponse(data: unknown, cacheSeconds: number): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${cacheSeconds}`,
    },
  });
}

export function errorResponse(message: string, status: number): Response {
  return new Response(message, { status });
}

/**
 * Renders a themed SVG error card instead of a plain-text body (docs/TODOS.md
 * 3.6) — an `<img>` tag embedded in a README can't display a text error
 * response, so a failed svg-format request should still return something
 * readable rather than a broken-image icon.
 */
export function svgErrorResponse(message: string, status: number): Response {
  const svg = renderJsxToSvg(ErrorCard({ message }));
  return new Response(svg, {
    status,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
