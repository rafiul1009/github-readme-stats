import { EN_CATALOG, CATALOGS, type LabelKey } from "./catalog";
import { getLocale } from "./locales";

/** Looks up a label for the given locale, falling back to English for any locale/key without a translation. */
export function t(locale: string | undefined, key: LabelKey, vars?: Record<string, string | number>): string {
  const code = getLocale(locale).code;
  const template = CATALOGS[code]?.[key] ?? EN_CATALOG[key];
  if (!vars) return template;
  return Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), template);
}
