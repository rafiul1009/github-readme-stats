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
import { BADGES_SCHEMA } from "@/widgets/badges/schema";
import { TECH_ICONS_SCHEMA } from "@/widgets/tech-icons/schema";
import { TYPING_HEADER_SCHEMA } from "@/widgets/typing-header/schema";
import { WAKATIME_SCHEMA } from "@/widgets/wakatime/schema";
import { QUOTE_SCHEMA } from "@/widgets/quote/schema";
import { SKYLINE_SCHEMA } from "@/widgets/skyline/schema";
import { MEDIUM_SCHEMA } from "@/widgets/medium/schema";
import { STACKOVERFLOW_SCHEMA } from "@/widgets/stackoverflow/schema";
import { NPM_DOWNLOADS_SCHEMA } from "@/widgets/npm-downloads/schema";
import { ROSTER_SCHEMA } from "@/widgets/roster/schema";

export interface WidgetCatalogEntry {
  type: string;
  label: string;
  schema: OptionSchema;
  /**
   * The schema field that identifies what to fetch — "username" for most
   * widgets, "repo"/"id" for pin/gist. Omitted for widgets with no single
   * required identifying value (e.g. quote, which needs nothing beyond its
   * own options to render).
   */
  identifyingField?: string;
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
  { type: "badges", label: "Badges", schema: BADGES_SCHEMA, identifyingField: "username" },
  { type: "tech-icons", label: "Tech Icons", schema: TECH_ICONS_SCHEMA, identifyingField: "name" },
  { type: "typing-header", label: "Typing Header", schema: TYPING_HEADER_SCHEMA, identifyingField: "lines" },
  { type: "wakatime", label: "WakaTime Stats", schema: WAKATIME_SCHEMA, identifyingField: "username" },
  { type: "quote", label: "Quote / Joke", schema: QUOTE_SCHEMA },
  { type: "skyline", label: "Contribution Skyline (3D)", schema: SKYLINE_SCHEMA, identifyingField: "username" },
  { type: "medium", label: "Medium Articles", schema: MEDIUM_SCHEMA, identifyingField: "username" },
  { type: "stackoverflow", label: "Stack Overflow", schema: STACKOVERFLOW_SCHEMA, identifyingField: "user_id" },
  { type: "npm-downloads", label: "npm Downloads", schema: NPM_DOWNLOADS_SCHEMA, identifyingField: "package" },
  { type: "roster", label: "Stargazers / Forks", schema: ROSTER_SCHEMA, identifyingField: "repo" },
];

export function getWidgetCatalogEntry(type: string): WidgetCatalogEntry | undefined {
  return WIDGET_CATALOG.find((entry) => entry.type === type);
}
