/**
 * Locale registry (docs/PLAN.md §4, task 5.1). Every entry here is a valid
 * `locale=` value: number/date formatting always works for it via `Intl`,
 * regardless of whether a hand-translated label catalog exists (see
 * catalog.ts). This is the same "scope down, document why" pattern as the
 * theme registry's D5 — ship a curated, verified set now, with an
 * architecture that costs nothing to extend later.
 */
export interface LocaleDef {
  code: string;
  label: string;
  rtl?: boolean;
}

export const LOCALES: LocaleDef[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "ru", label: "Русский" },
  { code: "uk", label: "Українська" },
  { code: "tr", label: "Türkçe" },
  { code: "sv", label: "Svenska" },
  { code: "cs", label: "Čeština" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "th", label: "ไทย" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ar", label: "العربية", rtl: true },
  { code: "he", label: "עברית", rtl: true },
  { code: "fa", label: "فارسی", rtl: true },
  { code: "ur", label: "اردو", rtl: true },
];

const BY_CODE = new Map(LOCALES.map((l) => [l.code.toLowerCase(), l]));
const FALLBACK: LocaleDef = LOCALES[0];

export function getLocale(code: string | undefined): LocaleDef {
  if (!code) return FALLBACK;
  return BY_CODE.get(code.toLowerCase()) ?? FALLBACK;
}

export function isRtlLocale(code: string | undefined): boolean {
  return getLocale(code).rtl === true;
}

export function isSupportedLocale(code: string): boolean {
  return BY_CODE.has(code.toLowerCase());
}
