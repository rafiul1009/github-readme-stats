/**
 * Approximate rendered text width for a sans-serif font, in "em" units
 * (multiply by font size for pixels). No canvas/font-metrics library is
 * available server-side, so this uses a small per-character-class table
 * (narrow punctuation/"i"/"l" vs. wide capitals vs. average) — the same
 * kind of heuristic shields.io historically used for its own badge
 * auto-sizing. Good enough for badge/pill widths; not exact typesetting.
 */
const NARROW = new Set("iIl.,:;'|!".split(""));
const WIDE = new Set("mMWw@".split(""));

export function estimateTextWidthEm(text: string): number {
  let width = 0;
  for (const ch of text) {
    if (NARROW.has(ch)) width += 0.32;
    else if (WIDE.has(ch)) width += 0.85;
    else if (ch >= "A" && ch <= "Z") width += 0.68;
    else if (ch === " ") width += 0.3;
    else width += 0.56;
  }
  return width;
}

export function estimateTextWidthPx(text: string, fontSize: number): number {
  return estimateTextWidthEm(text) * fontSize;
}
