/** Formats a count per the shared `number_format` option: "short" (1.5k) or "long" (1,500). */
export function formatNumber(value: number, format: "short" | "long" = "short"): string {
  if (format === "long") return value.toLocaleString("en-US");

  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${trimZero((value / 1_000_000).toFixed(1))}m`;
  if (abs >= 1_000) return `${trimZero((value / 1_000).toFixed(1))}k`;
  return String(value);
}

function trimZero(value: string): string {
  return value.replace(/\.0$/, "");
}
