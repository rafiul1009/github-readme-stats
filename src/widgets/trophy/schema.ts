import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const TROPHY_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  title: {
    type: "commaList",
    description:
      "Only show these trophies, by key (stars, commits, followers, issues, prs, repos, multi-language, multi-org, ancient-account, long-time-account, new-account, super-rank). Omit for all unlocked trophies.",
  },
  rank: {
    type: "commaList",
    description: "Only show trophies at these ranks (SSS, SS, S, AAA, AA, A, B, C, SECRET).",
  },
  column: {
    type: "number",
    description: "Number of tile columns.",
    default: 6,
    min: 1,
    max: 10,
  },
  row: {
    type: "number",
    description: "Number of tile rows.",
    default: 2,
    min: 1,
    max: 10,
  },
  margin_w: {
    type: "number",
    description: "Horizontal margin between tiles, in pixels.",
    default: 8,
    min: 0,
    max: 40,
  },
  margin_h: {
    type: "number",
    description: "Vertical margin between tiles, in pixels.",
    default: 8,
    min: 0,
    max: 40,
  },
  no_bg: {
    type: "boolean",
    description: "Hides each tile's background fill.",
    default: false,
  },
  no_frame: {
    type: "boolean",
    description: "Hides each tile's border.",
    default: false,
  },
} as const);

export type TrophyOptions = InferOptions<typeof TROPHY_SCHEMA>;
