import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const REPOS_PER_LANGUAGE_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  langs_count: {
    type: "number",
    description: "Number of languages to show.",
    default: 8,
    min: 1,
    max: 20,
  },
  hide: {
    type: "commaList",
    description: "Language names to exclude.",
  },
  exclude_repo: {
    type: "commaList",
    description: "Repo names to exclude from aggregation.",
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
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 320,
    min: 250,
  },
} as const);

export type ReposPerLanguageOptions = InferOptions<typeof REPOS_PER_LANGUAGE_SCHEMA>;
