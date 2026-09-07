import {
  Flame,
  BarChart3,
  Languages,
  BookMarked,
  FileCode2,
  LineChart,
  CalendarDays,
  Trophy,
  UserRound,
  PieChart,
  GitCommitHorizontal,
  Clock,
  Tags,
  Grid3x3,
  Type,
  Timer,
  Quote,
  Boxes,
  Newspaper,
  MessageCircleQuestion,
  Package,
  Users,
  type LucideIcon,
} from "lucide-react";
import { WIDGET_CATALOG, type WidgetCatalogEntry } from "@/widgets/catalog";

/**
 * Presentation metadata for the left sidebar's catalog (docs/TODOS.md 12.13).
 * Kept out of `@/widgets/catalog` because that module is consumed by the API
 * layer too and has no business importing an icon library.
 */
export const WIDGET_ICONS: Record<string, LucideIcon> = {
  streak: Flame,
  stats: BarChart3,
  "top-langs": Languages,
  pin: BookMarked,
  gist: FileCode2,
  "activity-graph": LineChart,
  heatmap: CalendarDays,
  trophy: Trophy,
  "profile-summary": UserRound,
  "repos-per-language": PieChart,
  "most-commit-language": GitCommitHorizontal,
  "productive-time": Clock,
  badges: Tags,
  "tech-icons": Grid3x3,
  "typing-header": Type,
  wakatime: Timer,
  quote: Quote,
  skyline: Boxes,
  medium: Newspaper,
  stackoverflow: MessageCircleQuestion,
  "npm-downloads": Package,
  roster: Users,
};

export interface WidgetGroup {
  title: string;
  hint: string;
  types: string[];
}

/** Mirrors PLAN.md §3's widget tiers. */
export const WIDGET_GROUPS: WidgetGroup[] = [
  {
    title: "Core GitHub",
    hint: "The cards most profiles start with.",
    types: ["streak", "stats", "top-langs", "pin", "gist", "activity-graph", "heatmap"],
  },
  {
    title: "Profile & achievements",
    hint: "Identity, trophies, and activity breakdowns.",
    types: ["trophy", "profile-summary", "repos-per-language", "most-commit-language", "productive-time"],
  },
  {
    title: "Badges & icons",
    hint: "Composable pill rows and a bundled tech-icon library.",
    types: ["badges", "tech-icons"],
  },
  {
    title: "Companion",
    hint: "The extras that make a README feel finished.",
    types: ["typing-header", "wakatime", "quote", "skyline"],
  },
  {
    title: "Beyond GitHub",
    hint: "Blog feeds, Q&A reputation, package downloads, repo rosters.",
    types: ["medium", "stackoverflow", "npm-downloads", "roster"],
  },
];

export function groupedWidgets(): { group: WidgetGroup; entries: WidgetCatalogEntry[] }[] {
  const seen = new Set<string>();
  const groups = WIDGET_GROUPS.map((group) => {
    const entries = group.types
      .map((type) => WIDGET_CATALOG.find((w) => w.type === type))
      .filter((e): e is WidgetCatalogEntry => Boolean(e));
    entries.forEach((e) => seen.add(e.type));
    return { group, entries };
  });

  // Any widget added to the catalog without being assigned a group still shows
  // up, rather than silently disappearing from the UI.
  const ungrouped = WIDGET_CATALOG.filter((w) => !seen.has(w.type));
  if (ungrouped.length > 0) {
    groups.push({ group: { title: "Other", hint: "", types: ungrouped.map((w) => w.type) }, entries: ungrouped });
  }
  return groups;
}
