import type { OptionSchema } from "@/lib/options";

/**
 * The option accordion's sections (docs/TODOS.md 12.14). The old builder
 * rendered every option in one flat two-column list, which put `cache_seconds`
 * next to `hide_border`. Grouping is by *what the option does to the card*,
 * derived from the option name so it needs no per-widget maintenance as
 * widgets are added.
 */
export type OptionGroupKey = "content" | "colors" | "layout" | "advanced";

export const OPTION_GROUP_ORDER: OptionGroupKey[] = ["content", "colors", "layout", "advanced"];

export const OPTION_GROUP_LABELS: Record<OptionGroupKey, { title: string; hint: string }> = {
  content: { title: "Content", hint: "What the card shows." },
  colors: { title: "Colours", hint: "Overrides applied on top of the theme." },
  layout: { title: "Layout & size", hint: "Dimensions, borders, and arrangement." },
  advanced: { title: "Advanced", hint: "Locale, caching, and output format." },
};

const LAYOUT_NAMES = new Set([
  "layout", "card_width", "card_height", "border_radius", "border_width", "hide_border",
  "line_height", "column", "columns", "row", "size", "margin_w", "margin_h", "align",
  "width", "height", "padding", "gap",
]);

const ADVANCED_NAMES = new Set([
  "locale", "number_format", "cache_seconds", "format", "timezone", "date_format",
  "disable_animations", "api_domain", "starting_year", "size_weight", "count_weight",
]);

export function optionGroupFor(name: string): OptionGroupKey {
  if (name.endsWith("_color") || name === "color" || name === "themes") return "colors";
  if (LAYOUT_NAMES.has(name)) return "layout";
  if (ADVANCED_NAMES.has(name)) return "advanced";
  return "content";
}

/** Rendered by dedicated UI elsewhere, not the generic field list. */
export const HANDLED_ELSEWHERE = new Set(["theme", "format"]);

export function groupOptions(
  schema: OptionSchema,
  identifyingField: string | undefined
): Record<OptionGroupKey, string[]> {
  const groups: Record<OptionGroupKey, string[]> = {
    content: [],
    colors: [],
    layout: [],
    advanced: [],
  };
  for (const name of Object.keys(schema)) {
    if (HANDLED_ELSEWHERE.has(name) || name === identifyingField) continue;
    groups[optionGroupFor(name)].push(name);
  }
  return groups;
}
