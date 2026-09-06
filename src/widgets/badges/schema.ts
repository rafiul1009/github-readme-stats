import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const BADGES_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  name: {
    type: "commaList",
    description:
      "Badge types to show, in order. User badges: repositories, followers, organization, languages, total-stars, total-contributors, total-commits, total-code-reviews, total-issues, total-pull-requests, total-joined-years (need username). Repo badges: stars, forks, contributors, issues, pull-requests, watchers, size (need repo).",
  },
  repo: {
    type: "string",
    description: 'Repository, as "owner/name" — required for repo-scoped badge types.',
  },
  themes: {
    type: "commaList",
    description: "Cycles a theme per badge index (badge[i] uses themes[i % themes.length]). Falls back to `theme` when omitted.",
  },
  column: {
    type: "number",
    description: "Badges per row.",
    default: 4,
    min: 1,
    max: 50,
  },
  size: {
    type: "number",
    description: "Badge height, in pixels.",
    default: 28,
    min: 18,
    max: 60,
  },
  p: {
    type: "number",
    description: "Padding/gap between badges, in pixels.",
    default: 8,
    min: 0,
    max: 40,
  },
  glow: {
    type: "boolean",
    description: "Adds a soft glow behind each badge.",
    default: false,
  },
  wave: {
    type: "boolean",
    description: "Gently bobs each badge up and down, staggered.",
    default: false,
  },
} as const);

export type BadgesOptions = InferOptions<typeof BADGES_SCHEMA>;
