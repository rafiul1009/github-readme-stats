import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const TOP_LANGS_LAYOUTS = ["normal", "compact", "donut", "donut-vertical", "pie"] as const;

export const TOP_LANGS_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  hide: {
    type: "commaList",
    description: "Hides the specified languages from the card.",
  },
  layout: {
    type: "enum",
    description: "Card layout.",
    values: TOP_LANGS_LAYOUTS,
    default: "normal",
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 300,
    min: 200,
  },
  langs_count: {
    type: "number",
    description: "Number of languages to show.",
    default: 5,
    min: 1,
    max: 20,
  },
  exclude_repo: {
    type: "commaList",
    description: "Excludes the specified repositories from the language aggregation.",
  },
  repo: {
    type: "commaList",
    description: "Only aggregates the specified repositories (an allowlist), instead of all of them.",
  },
  role: {
    type: "commaList",
    description: "Repository affiliation(s) to aggregate: OWNER, ORGANIZATION_MEMBER, COLLABORATOR. Defaults to OWNER. Ignored when owner is set.",
  },
  owner: {
    type: "string",
    description: "Aggregates this organization's repositories instead of username's own.",
  },
  hide_progress: {
    type: "boolean",
    description: "Hides percentages and progress bars (layout becomes compact).",
    default: false,
  },
  size_weight: {
    type: "number",
    description: "Weight of byte size in the ranking algorithm.",
    default: 1,
    min: 0,
  },
  count_weight: {
    type: "number",
    description: "Weight of repo count in the ranking algorithm.",
    default: 0,
    min: 0,
  },
} as const);

export type TopLangsOptions = InferOptions<typeof TOP_LANGS_SCHEMA>;
