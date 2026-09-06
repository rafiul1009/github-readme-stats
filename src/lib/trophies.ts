import type { StatIconName } from "@/widgets/stats/icons";
import type { LabelKey } from "@/lib/i18n";

/**
 * Trophy rank tiers and standard-trophy thresholds (docs/PLAN.md §7 D7):
 * adopted verbatim from ryo-ma/github-profile-trophy's published rank
 * table (src/trophy.ts in that project — see NOTICE), not invented here,
 * so a user's rank on this card matches the rank they already have
 * elsewhere. Secret-trophy *thresholds* below (multi-language, multi-org,
 * long-time-account) also match that project's published values; the
 * *conditions* for the account-age secret trophies (new/ancient account)
 * are ours, since upstream deliberately keeps exact secret conditions
 * undocumented — ours are a reasonable, disclosed analog.
 */
export const RANK_ORDER = ["SSS", "SS", "S", "AAA", "AA", "A", "B", "C", "UNKNOWN", "SECRET"] as const;
export type TrophyRank = (typeof RANK_ORDER)[number];

interface ThresholdTable {
  SSS: number;
  SS: number;
  S: number;
  AAA: number;
  AA: number;
  A: number;
  B: number;
  C: number;
}

const TIERS: (keyof ThresholdTable)[] = ["SSS", "SS", "S", "AAA", "AA", "A", "B", "C"];

const THRESHOLDS: Record<string, ThresholdTable> = {
  stars: { SSS: 2000, SS: 700, S: 200, AAA: 100, AA: 50, A: 30, B: 10, C: 1 },
  commits: { SSS: 4000, SS: 2000, S: 1000, AAA: 500, AA: 200, A: 100, B: 10, C: 1 },
  followers: { SSS: 1000, SS: 400, S: 200, AAA: 100, AA: 50, A: 20, B: 10, C: 1 },
  issues: { SSS: 1000, SS: 500, S: 200, AAA: 100, AA: 50, A: 20, B: 10, C: 1 },
  prs: { SSS: 1000, SS: 500, S: 200, AAA: 100, AA: 50, A: 20, B: 10, C: 1 },
  repos: { SSS: 50, SS: 45, S: 40, AAA: 35, AA: 30, A: 20, B: 10, C: 1 },
};

/** Secret-trophy numeric thresholds, from the same upstream table. */
const MULTI_LANGUAGE_THRESHOLD = 10;
const MULTI_ORG_THRESHOLD = 3;
const LONG_TIME_ACCOUNT_YEARS = 10;
/** Ours: an account is "ancient" if created before GitHub's major 2013 platform rebuild. */
const ANCIENT_ACCOUNT_BEFORE = new Date("2013-01-01T00:00:00Z");

export interface TrophyDefinition {
  key: string;
  titleKey: LabelKey;
  icon: StatIconName;
}

export const STANDARD_TROPHIES: TrophyDefinition[] = [
  { key: "stars", titleKey: "trophyStars", icon: "star" },
  { key: "commits", titleKey: "trophyCommits", icon: "commit" },
  { key: "followers", titleKey: "trophyFollowers", icon: "follower" },
  { key: "issues", titleKey: "trophyIssues", icon: "issue" },
  { key: "prs", titleKey: "trophyPrs", icon: "pr" },
  { key: "repos", titleKey: "trophyRepos", icon: "repo" },
];

export interface Trophy {
  key: string;
  titleKey: LabelKey;
  icon: StatIconName;
  value: number;
  rank: TrophyRank;
  secret: boolean;
  /** 0-1 progress toward the next-better rank; omitted at the top rank or for secret trophies. */
  progressToNext?: number;
  nextRankThreshold?: number;
}

function rankForValue(value: number, thresholds: ThresholdTable): keyof ThresholdTable | "UNKNOWN" {
  for (const tier of TIERS) {
    if (value >= thresholds[tier]) return tier;
  }
  return "UNKNOWN";
}

function nextTier(rank: keyof ThresholdTable | "UNKNOWN"): keyof ThresholdTable | null {
  if (rank === "UNKNOWN") return "C";
  const index = TIERS.indexOf(rank);
  return index > 0 ? TIERS[index - 1] : null;
}

function buildStandardTrophy(def: TrophyDefinition, value: number): Trophy {
  const thresholds = THRESHOLDS[def.key];
  const rank = rankForValue(value, thresholds);
  const next = nextTier(rank);

  if (!next) {
    return { key: def.key, titleKey: def.titleKey, icon: def.icon, value, rank, secret: false };
  }

  const prevThreshold = rank === "UNKNOWN" ? 0 : thresholds[rank];
  const nextThreshold = thresholds[next];
  const progressToNext = Math.min(Math.max((value - prevThreshold) / (nextThreshold - prevThreshold), 0), 1);

  return {
    key: def.key,
    titleKey: def.titleKey,
    icon: def.icon,
    value,
    rank,
    secret: false,
    progressToNext,
    nextRankThreshold: nextThreshold,
  };
}

export interface TrophyInput {
  stars: number;
  commits: number;
  followers: number;
  issues: number;
  prs: number;
  repos: number;
  languageCount: number;
  organizationsCount: number;
  createdAt: string;
}

/**
 * Computes the full trophy list: the 6 standard trophies always, plus any
 * secret trophies whose condition is met (unmet secret trophies are
 * omitted entirely, matching upstream's "won't display until unlocked"
 * behavior — see docs/TODOS.md 7.1/7.9).
 */
export function computeTrophies(input: TrophyInput): Trophy[] {
  const standard = STANDARD_TROPHIES.map((def) => buildStandardTrophy(def, input[def.key as keyof TrophyInput] as number));

  const secrets: Trophy[] = [];
  const createdAt = new Date(input.createdAt);
  const now = new Date();
  const accountAgeYears = (now.getTime() - createdAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  if (input.languageCount >= MULTI_LANGUAGE_THRESHOLD) {
    secrets.push({
      key: "multi-language",
      titleKey: "trophySecretMultiLanguage",
      icon: "contrib",
      value: input.languageCount,
      rank: "SECRET",
      secret: true,
    });
  }

  if (input.organizationsCount >= MULTI_ORG_THRESHOLD) {
    secrets.push({
      key: "multi-org",
      titleKey: "trophySecretMultiOrg",
      icon: "follower",
      value: input.organizationsCount,
      rank: "SECRET",
      secret: true,
    });
  }

  if (createdAt < ANCIENT_ACCOUNT_BEFORE) {
    secrets.push({
      key: "ancient-account",
      titleKey: "trophySecretAncientAccount",
      icon: "star",
      value: createdAt.getUTCFullYear(),
      rank: "SECRET",
      secret: true,
    });
  }

  if (accountAgeYears >= LONG_TIME_ACCOUNT_YEARS) {
    secrets.push({
      key: "long-time-account",
      titleKey: "trophySecretLongTimeAccount",
      icon: "commit",
      value: Math.floor(accountAgeYears),
      rank: "SECRET",
      secret: true,
    });
  }

  if (now.getUTCFullYear() === createdAt.getUTCFullYear()) {
    secrets.push({
      key: "new-account",
      titleKey: "trophySecretNewAccount",
      icon: "issue",
      value: createdAt.getUTCFullYear(),
      rank: "SECRET",
      secret: true,
    });
  }

  if (standard.every((trophy) => trophy.rank === "SSS" || trophy.rank === "SS" || trophy.rank === "S")) {
    secrets.push({ key: "super-rank", titleKey: "trophySecretSuperRank", icon: "pr", value: 1, rank: "SECRET", secret: true });
  }

  return [...standard, ...secrets];
}
