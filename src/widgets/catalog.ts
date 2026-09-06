import type { OptionSchema } from "@/lib/options";
import { STREAK_SCHEMA } from "@/widgets/streak/schema";
import { STATS_SCHEMA } from "@/widgets/stats/schema";
import { TOP_LANGS_SCHEMA } from "@/widgets/top-langs/schema";
import { PIN_SCHEMA } from "@/widgets/pin/schema";
import { GIST_SCHEMA } from "@/widgets/gist/schema";
import { ACTIVITY_GRAPH_SCHEMA } from "@/widgets/activity-graph/schema";
import { HEATMAP_SCHEMA } from "@/widgets/heatmap/schema";
import { TROPHY_SCHEMA } from "@/widgets/trophy/schema";
import { PROFILE_SUMMARY_SCHEMA } from "@/widgets/profile-summary/schema";
import { REPOS_PER_LANGUAGE_SCHEMA } from "@/widgets/repos-per-language/schema";
import { MOST_COMMIT_LANGUAGE_SCHEMA } from "@/widgets/most-commit-language/schema";
import { PRODUCTIVE_TIME_SCHEMA } from "@/widgets/productive-time/schema";

export interface WidgetCatalogEntry {
  type: string;
  label: string;
  schema: OptionSchema;
  /** The schema field that identifies what to fetch — "username" for most widgets, "repo"/"id" for pin/gist. */
  identifyingField: string;
}

/**
 * Client-safe widget listing for the builder UI: type + display label +
 * option schema only, imported from each widget's schema.ts (never its
 * index.ts, which pulls in server-only code like @/lib/github). Extend
 * this as new widgets are added in later phases.
 */
export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  { type: "streak", label: "Contribution Streak", schema: STREAK_SCHEMA, identifyingField: "username" },
  { type: "stats", label: "Stats Overview", schema: STATS_SCHEMA, identifyingField: "username" },
  { type: "top-langs", label: "Top Languages", schema: TOP_LANGS_SCHEMA, identifyingField: "username" },
  { type: "pin", label: "Pinned Repository", schema: PIN_SCHEMA, identifyingField: "repo" },
  { type: "gist", label: "Gist", schema: GIST_SCHEMA, identifyingField: "id" },
  { type: "activity-graph", label: "Contribution Activity Graph", schema: ACTIVITY_GRAPH_SCHEMA, identifyingField: "username" },
  { type: "heatmap", label: "Contribution Heatmap", schema: HEATMAP_SCHEMA, identifyingField: "username" },
  { type: "trophy", label: "GitHub Trophies", schema: TROPHY_SCHEMA, identifyingField: "username" },
  { type: "profile-summary", label: "Profile Summary", schema: PROFILE_SUMMARY_SCHEMA, identifyingField: "username" },
  { type: "repos-per-language", label: "Repos per Language", schema: REPOS_PER_LANGUAGE_SCHEMA, identifyingField: "username" },
  { type: "most-commit-language", label: "Most Commit Language", schema: MOST_COMMIT_LANGUAGE_SCHEMA, identifyingField: "username" },
  { type: "productive-time", label: "Productive Time", schema: PRODUCTIVE_TIME_SCHEMA, identifyingField: "username" },
];

export function getWidgetCatalogEntry(type: string): WidgetCatalogEntry | undefined {
  return WIDGET_CATALOG.find((entry) => entry.type === type);
}
