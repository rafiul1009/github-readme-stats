import type { RawUserStats } from "@/lib/githubStats";
import type { RawRepoData } from "@/lib/githubRepo";
import { formatNumber } from "@/lib/format";
import type { LabelKey } from "@/lib/i18n";

export type BadgeScope = "user" | "repo";

export interface BadgeValue {
  key: string;
  labelKey: LabelKey;
  value: string;
}

interface BadgeDefinition {
  key: string;
  scope: BadgeScope;
  labelKey: LabelKey;
}

/**
 * Badge type catalog (docs/TODOS.md 8.2/8.3). `visitors` is intentionally
 * absent — it's blocked on durable storage (Phase 10.1, see 8.4) and isn't
 * implemented yet; requesting it produces the same "unknown badge" fallback
 * as a typo'd name, not a crash.
 */
const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { key: "repositories", scope: "user", labelKey: "badgeRepositories" },
  { key: "followers", scope: "user", labelKey: "followers" },
  { key: "organization", scope: "user", labelKey: "badgeOrganization" },
  { key: "languages", scope: "user", labelKey: "badgeLanguages" },
  { key: "total-stars", scope: "user", labelKey: "totalStars" },
  { key: "total-contributors", scope: "user", labelKey: "badgeTotalContributors" },
  { key: "total-commits", scope: "user", labelKey: "totalCommits" },
  { key: "total-code-reviews", scope: "user", labelKey: "prReviews" },
  { key: "total-issues", scope: "user", labelKey: "totalIssues" },
  { key: "total-pull-requests", scope: "user", labelKey: "totalPRs" },
  { key: "total-joined-years", scope: "user", labelKey: "badgeJoinedYears" },
  { key: "stars", scope: "repo", labelKey: "totalStars" },
  { key: "forks", scope: "repo", labelKey: "badgeForks" },
  { key: "contributors", scope: "repo", labelKey: "badgeContributors" },
  { key: "issues", scope: "repo", labelKey: "totalIssues" },
  { key: "pull-requests", scope: "repo", labelKey: "totalPRs" },
  { key: "watchers", scope: "repo", labelKey: "badgeWatchers" },
  { key: "size", scope: "repo", labelKey: "badgeSize" },
];

const BY_KEY = new Map(BADGE_DEFINITIONS.map((def) => [def.key, def]));

/** Badge keys grouped by scope, for the builder's multi-select picker (docs/TODOS.md 8.8). */
export const USER_BADGE_KEYS = BADGE_DEFINITIONS.filter((d) => d.scope === "user").map((d) => d.key);
export const REPO_BADGE_KEYS = BADGE_DEFINITIONS.filter((d) => d.scope === "repo").map((d) => d.key);

export function getBadgeDefinition(key: string): BadgeDefinition | undefined {
  return BY_KEY.get(key);
}

export function badgeScope(key: string): BadgeScope | undefined {
  return BY_KEY.get(key)?.scope;
}

function formatSize(kb: number): string {
  if (kb >= 1_000_000) return `${(kb / 1_000_000).toFixed(1)} GB`;
  if (kb >= 1_000) return `${(kb / 1_000).toFixed(1)} MB`;
  return `${kb} KB`;
}

function userBadgeValue(key: string, stats: RawUserStats, numberFormat: "short" | "long", locale: string): string | undefined {
  switch (key) {
    case "repositories":
      return formatNumber(stats.totalRepos, numberFormat, locale);
    case "followers":
      return formatNumber(stats.followers, numberFormat, locale);
    case "organization":
      return formatNumber(stats.organizationsCount, numberFormat, locale);
    case "languages":
      return formatNumber(stats.languageCount, numberFormat, locale);
    case "total-stars":
      return formatNumber(stats.totalStars, numberFormat, locale);
    case "total-contributors":
      // "Contributed to" repo count — see docs/TODOS.md 8.2 note: the GitHub
      // API has no "total contributors across your own repos" metric; this
      // is the closest available proxy for a user-scoped contributor stat.
      return formatNumber(stats.contributedTo, numberFormat, locale);
    case "total-commits":
      return formatNumber(stats.allTimeCommits ?? stats.currentYearCommits, numberFormat, locale);
    case "total-code-reviews":
      return formatNumber(stats.reviews, numberFormat, locale);
    case "total-issues":
      return formatNumber(stats.totalIssues, numberFormat, locale);
    case "total-pull-requests":
      return formatNumber(stats.totalPRs, numberFormat, locale);
    case "total-joined-years": {
      const years = Math.floor((Date.now() - new Date(stats.createdAt).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return String(Math.max(years, 0));
    }
    default:
      return undefined;
  }
}

function repoBadgeValue(
  key: string,
  repo: RawRepoData & { contributors?: number },
  numberFormat: "short" | "long",
  locale: string
): string | undefined {
  switch (key) {
    case "stars":
      return formatNumber(repo.stars, numberFormat, locale);
    case "forks":
      return formatNumber(repo.forks, numberFormat, locale);
    case "contributors":
      return repo.contributors !== undefined ? formatNumber(repo.contributors, numberFormat, locale) : "N/A";
    case "issues":
      return formatNumber(repo.issues, numberFormat, locale);
    case "pull-requests":
      return formatNumber(repo.pullRequests, numberFormat, locale);
    case "watchers":
      return formatNumber(repo.watchers, numberFormat, locale);
    case "size":
      return formatSize(repo.sizeKb);
    default:
      return undefined;
  }
}

/**
 * Resolves each requested badge name to a {label, value} pair, in the
 * order requested. Unknown names, or names whose required scope's data
 * wasn't fetched (e.g. a repo badge with no `repo` given), degrade to an
 * "N/A" value rather than dropping the badge or failing the whole request
 * — a badge grid is meant to be composed from a user-supplied list, and one
 * bad entry shouldn't take the others down with it.
 */
export function resolveBadges(
  names: string[],
  userStats: RawUserStats | undefined,
  repoData: (RawRepoData & { contributors?: number }) | undefined,
  numberFormat: "short" | "long",
  locale: string
): BadgeValue[] {
  return names.map((key) => {
    const def = getBadgeDefinition(key);
    if (!def) {
      return { key, labelKey: "badgeUnknown" as LabelKey, value: "N/A" };
    }

    const value =
      def.scope === "user"
        ? userStats && userBadgeValue(key, userStats, numberFormat, locale)
        : repoData && repoBadgeValue(key, repoData, numberFormat, locale);

    return { key, labelKey: def.labelKey, value: value ?? "N/A" };
  });
}
