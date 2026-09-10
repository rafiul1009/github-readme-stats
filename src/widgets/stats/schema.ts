import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";
import { DEFAULT_FONT } from "@/lib/fonts";

export const STATS_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  font: {
    type: "string",
    description: "Font family used in the card text.",
    default: DEFAULT_FONT,
  },
  hide: {
    type: "commaList",
    description: "Hides the specified stat rows: stars, commits, prs, issues, contribs.",
  },
  show: {
    type: "commaList",
    description:
      "Shows additional stat rows: reviews, discussions_started, discussions_answered, prs_merged, prs_merged_percentage.",
  },
  show_icons: {
    type: "boolean",
    description: "Shows an icon next to each stat row.",
    default: false,
  },
  hide_rank: {
    type: "boolean",
    description: "Hides the rank circle and shrinks the card to fit.",
    default: false,
  },
  rank_icon: {
    type: "enum",
    description: "Alternate rank display.",
    values: ["default", "github", "percentile"],
    default: "default",
  },
  include_all_commits: {
    type: "boolean",
    description: "Counts all-time commits instead of just the current year's.",
    default: false,
  },
  commits_year: {
    type: "number",
    description: "Scopes the commit count to one specific calendar year instead of the past 12 months. Overrides include_all_commits when set.",
    min: 2005,
  },
  line_height: {
    type: "number",
    description: "Vertical spacing between stat rows, in pixels.",
    default: 25,
    min: 15,
    max: 50,
  },
  text_bold: {
    type: "boolean",
    description: "Uses bold text for stat values.",
    default: true,
  },
  ring_color: {
    type: "color",
    description: "Color of the rank circle.",
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 450,
    min: 300,
  },
} as const);

export type StatsOptions = InferOptions<typeof STATS_SCHEMA>;
