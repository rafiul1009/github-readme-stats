import { Resvg } from "@resvg/resvg-js";

/**
 * PNG rasterization (deferred from Phase 0 task 0.10 to Phase 7/5.8 per
 * D3 — PNG is the only format needing a native binary + bundled fonts, so
 * it stays off the Edge-safe rendering path). Node-only: `@resvg/resvg-js`
 * ships a platform-specific native addon, which is why PNG is not offered
 * from the edge runtime and why animations (`disable_animations`) should
 * be forced on by the caller before rendering to PNG — resvg rasterizes a
 * single static frame, so `<animate>`/CSS `@keyframes` just freeze at
 * their initial state instead of erroring, but that initial state is
 * usually a mid-fade-in, not the final look.
 */
export function renderSvgToPng(svg: string, width?: number): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: width ? { mode: "width", value: width } : undefined,
    font: { loadSystemFonts: true },
  });
  return resvg.render().asPng();
}

export function pngResponse(png: Buffer, cacheSeconds: number): Response {
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": `public, max-age=${cacheSeconds}`,
    },
  });
}
