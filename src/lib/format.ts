/**
 * Formats a count per the shared `number_format` option: "short" (1.5k) or
 * "long" (locale-grouped, e.g. "1,500" in en, "1.500" in de). The "short"
 * form's k/m suffixes are an ASCII convention with no meaningful per-locale
 * equivalent at this scope, so only "long" grouping is locale-aware.
 */
export function formatNumber(value: number, format: "short" | "long" = "short", locale = "en"): string {
  if (format === "long") {
    try {
      return value.toLocaleString(locale);
    } catch {
      return value.toLocaleString("en-US");
    }
  }

  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${trimZero((value / 1_000_000).toFixed(1))}m`;
  if (abs >= 1_000) return `${trimZero((value / 1_000).toFixed(1))}k`;
  return String(value);
}

function trimZero(value: string): string {
  return value.replace(/\.0$/, "");
}
