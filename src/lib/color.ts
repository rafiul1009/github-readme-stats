/**
 * Color value parsing shared by every widget's theme/override system.
 *
 * Accepted forms (matching the established ecosystem vocabulary — see docs/PLAN.md D9):
 *   - 6-digit hex, with or without a leading "#"        e.g. "4c71f2", "#4c71f2"
 *   - 8-digit hex with alpha, with or without "#"        e.g. "00000000" (transparent)
 *   - CSS named colors                                   e.g. "white", "transparent"
 *   - gradient: "angleDeg,color1,color2[,...,colorN]"    e.g. "30,e96443,904e95"
 */

export interface GradientValue {
  type: "gradient";
  angle: number;
  stops: string[];
}

export interface SolidValue {
  type: "solid";
  color: string;
}

export type ColorValue = SolidValue | GradientValue;

const HEX_RE = /^#?[0-9a-fA-F]{6}$/;
const HEX_ALPHA_RE = /^#?[0-9a-fA-F]{8}$/;

// A small allowlist is enough here: we only need to distinguish "this looks like
// a bare hex string missing its #" from "this is a CSS keyword", not validate
// every keyword the CSS spec defines. Anything not in the list is still passed
// through as a solid color value (harmless if invalid, and permissive of ones
// this list happens to miss).
const CSS_NAMED_COLORS = new Set([
  "transparent",
  "currentcolor",
  "black",
  "white",
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
  "purple",
  "pink",
  "gray",
  "grey",
  "brown",
  "cyan",
  "magenta",
  "lime",
  "navy",
  "teal",
  "olive",
  "maroon",
  "silver",
  "gold",
  "indigo",
  "violet",
  "coral",
  "salmon",
  "khaki",
  "crimson",
  "chocolate",
  "tomato",
  "orchid",
  "plum",
  "turquoise",
  "skyblue",
  "steelblue",
  "slategray",
  "slategrey",
  "royalblue",
  "midnightblue",
  "forestgreen",
  "seagreen",
  "darkgreen",
  "darkred",
  "darkblue",
  "darkorange",
  "hotpink",
  "deeppink",
  "firebrick",
]);

function normalizeHex(value: string): string {
  return value.startsWith("#") ? value : `#${value}`;
}

/**
 * Normalizes a single (non-gradient) color token into a CSS-consumable string.
 * Bare hex digits (no "#") are given one; named colors and anything already
 * prefixed/formatted (rgb(), hsl(), #-prefixed hex) pass through unchanged.
 */
export function normalizeColorToken(value: string): string {
  const trimmed = value.trim();
  if (HEX_RE.test(trimmed) || HEX_ALPHA_RE.test(trimmed)) {
    return normalizeHex(trimmed);
  }
  if (CSS_NAMED_COLORS.has(trimmed.toLowerCase())) {
    return trimmed.toLowerCase();
  }
  // Already-qualified values (rgb(...), hsl(...), #hex, unknown-but-plausible
  // CSS color) are passed through as-is rather than rejected — the renderer
  // is the final authority on validity, not this parser.
  return trimmed;
}

/**
 * Parses a `bg_color`-style query value into either a solid color or a
 * gradient descriptor. A gradient is any comma-separated value whose first
 * segment parses as a plain number (the angle in degrees); everything else
 * is treated as a single solid color (even if it happens to contain a comma
 * inside an already-qualified value like "rgb(0,0,0)", which contains no
 * top-level comma-first numeric angle).
 */
export function parseColorValue(raw: string): ColorValue {
  const trimmed = raw.trim();
  const parts = trimmed.split(",").map((part) => part.trim());

  if (parts.length >= 3) {
    const angle = Number(parts[0]);
    if (Number.isFinite(angle)) {
      const stops = parts.slice(1).map(normalizeColorToken);
      return { type: "gradient", angle, stops };
    }
  }

  return { type: "solid", color: normalizeColorToken(trimmed) };
}

/** Renders a parsed color value as something usable in an SVG `fill`/`stop-color` context. */
export function colorValueToCss(value: ColorValue): string {
  if (value.type === "solid") return value.color;
  // Solid fallback for contexts that can't reference a <linearGradient> def
  // (e.g. inline style attributes outside the SVG's own <defs>).
  return value.stops[0] ?? "transparent";
}

/**
 * Normalizes a raw query-param color value (e.g. a `title_color`/`text_color`/
 * `icon_color`/`border_color` override) into a single CSS color string.
 * Gradients aren't meaningful for these single-purpose slots, so a gradient
 * input falls back to its first stop (see colorValueToCss). Use
 * `parseColorValue` directly instead when the slot should support gradients
 * (currently only `bg_color`, handled by the Card primitive).
 */
export function normalizeOverrideColor(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return colorValueToCss(parseColorValue(raw));
}
