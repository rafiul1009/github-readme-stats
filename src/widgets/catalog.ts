import type { OptionSchema } from "@/lib/options";
import { STREAK_SCHEMA } from "@/widgets/streak/schema";
import { STATS_SCHEMA } from "@/widgets/stats/schema";
import { TOP_LANGS_SCHEMA } from "@/widgets/top-langs/schema";

export interface WidgetCatalogEntry {
  type: string;
  label: string;
  schema: OptionSchema;
}

/**
 * Client-safe widget listing for the builder UI: type + display label +
 * option schema only, imported from each widget's schema.ts (never its
 * index.ts, which pulls in server-only code like @/lib/github). Extend
 * this as new widgets are added in later phases.
 */
export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  { type: "streak", label: "Contribution Streak", schema: STREAK_SCHEMA },
  { type: "stats", label: "Stats Overview", schema: STATS_SCHEMA },
  { type: "top-langs", label: "Top Languages", schema: TOP_LANGS_SCHEMA },
];

export function getWidgetCatalogEntry(type: string): WidgetCatalogEntry | undefined {
  return WIDGET_CATALOG.find((entry) => entry.type === type);
}
