import type { ReactElement } from "react";
// react-dom/server.edge (rather than the bare "react-dom/server" entry) sidesteps
// Next.js's app-router build check that otherwise flags any react-dom/server import
// reachable from src/app as "importing a component that imports react-dom/server" —
// it works correctly under the Node runtime too, not just edge.
//
// In a *production* build this specifier is additionally marked external in
// next.config.ts, so webpack emits a real runtime `require` instead of bundling
// it. Without that, webpack resolves react-dom with the `react-server` export
// condition active (route handlers live in React's server-component module
// graph) and every server subpath in react-dom's exports map is gated on it,
// pointing at a stub that throws "react-dom/server is not supported in React
// Server Components". See the comment in next.config.ts.
import { renderToStaticMarkup } from "react-dom/server.edge";
import { ErrorCard } from "@/components/card/ErrorCard";

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

export function errorResponse(message: string, status: number, retryAfterSeconds?: number): Response {
  return new Response(message, {
    status,
    headers: retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : undefined,
  });
}

/**
 * Renders a themed SVG error card instead of a plain-text body (docs/TODOS.md
 * 3.6) — an `<img>` tag embedded in a README can't display a text error
 * response, so a failed svg-format request should still return something
 * readable rather than a broken-image icon.
 */
export function svgErrorResponse(message: string, status: number, retryAfterSeconds?: number): Response {
  const svg = renderJsxToSvg(ErrorCard({ message }));
  return new Response(svg, {
    status,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
      ...(retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {}),
    },
  });
}
