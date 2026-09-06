/**
 * Custom `date_format` engine (task 5.4), mirroring streak-stats' own
 * bracket-conditional-year convention per D9 (mirror upstream names/
 * behavior rather than inventing our own). Tokens are PHP `date()`-style
 * single letters, matched literally (no locale-specific letters collide
 * with them, so no escaping syntax is needed at this scope):
 *
 *   d  day of month, zero-padded      (05)
 *   j  day of month, no padding       (5)
 *   M  month, short name              (Jan)
 *   F  month, full name               (January)
 *   m  month, zero-padded             (01)
 *   n  month, no padding              (1)
 *   Y  full year                      (2024)
 *   y  two-digit year                 (24)
 *
 * A `[...]` segment is included only when the date's year differs from
 * `referenceYear` (normally the current year), so recent dates render
 * without a year and older ones pick one up automatically — the same
 * behavior as the reference project's `M j[, Y]` default.
 */
export const DEFAULT_DATE_FORMAT = "M j[, Y]";

const TOKEN_RE = /d|j|F|M|m|n|Y|y/g;

function monthName(date: Date, locale: string, style: "short" | "long"): string {
  try {
    return new Intl.DateTimeFormat(locale, { month: style }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en", { month: style }).format(date);
  }
}

function expandTokens(pattern: string, date: Date, locale: string): string {
  return pattern.replace(TOKEN_RE, (token) => {
    switch (token) {
      case "d":
        return String(date.getDate()).padStart(2, "0");
      case "j":
        return String(date.getDate());
      case "M":
        return monthName(date, locale, "short");
      case "F":
        return monthName(date, locale, "long");
      case "m":
        return String(date.getMonth() + 1).padStart(2, "0");
      case "n":
        return String(date.getMonth() + 1);
      case "Y":
        return String(date.getFullYear());
      case "y":
        return String(date.getFullYear()).slice(-2);
      default:
        return token;
    }
  });
}

export function formatDatePattern(date: Date, pattern: string, locale: string, referenceYear: number): string {
  const includeBracket = date.getFullYear() !== referenceYear;
  const withBrackets = pattern.replace(/\[([^\]]*)\]/g, (_, inner: string) => (includeBracket ? inner : ""));
  return expandTokens(withBrackets, date, locale);
}
