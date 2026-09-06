import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const ROSTER_KINDS = ["stargazers", "forks"] as const;

export const ROSTER_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  repo: {
    type: "string",
    description: 'Repository to list, as "owner/name".',
  },
  kind: {
    type: "enum",
    description: "Which roster to show.",
    values: ROSTER_KINDS,
    default: "stargazers",
  },
  limit: {
    type: "number",
    description: "Maximum avatars to fetch and show — a hard cap, not just a default (docs/TODOS.md 11.4).",
    default: 24,
    min: 1,
    max: 60,
  },
  columns: {
    type: "number",
    description: "Avatars per row.",
    default: 10,
    min: 1,
    max: 30,
  },
  size: {
    type: "number",
    description: "Avatar diameter, in pixels.",
    default: 36,
    min: 16,
    max: 80,
  },
} as const);

export type RosterOptions = InferOptions<typeof ROSTER_SCHEMA>;
