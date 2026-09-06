import { graphql } from "@octokit/graphql";
import { githubAuthHeaders } from "@/lib/githubAuth";
import { wrapGithubError } from "@/lib/githubErrors";

/** Rotates across the token pool (docs/TODOS.md 10.2) on every call, unlike `graphql.defaults`' static header. */
function graphqlWithAuth<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  return graphql<T>(query, { ...variables, headers: githubAuthHeaders() });
}

/**
 * Repo-scoping filters shared by every repo-aggregating query in this file
 * (docs/TODOS.md 10.3). `role` maps directly onto GitHub's own
 * RepositoryAffiliation enum and only applies to a user-owned query;
 * setting `owner` switches the aggregation to that organization's repos
 * entirely (an org has no concept of "affiliation" — it's not relative to
 * a user — so `role` is ignored whenever `owner` is set).
 */
export type RepoRole = "OWNER" | "ORGANIZATION_MEMBER" | "COLLABORATOR";
const VALID_ROLES: readonly RepoRole[] = ["OWNER", "ORGANIZATION_MEMBER", "COLLABORATOR"];

export interface RepoScopeOptions {
  role?: string[];
  owner?: string;
}

function normalizeRoles(role: string[] | undefined): RepoRole[] {
  const roles = (role ?? [])
    .map((r) => r.trim().toUpperCase())
    .filter((r): r is RepoRole => (VALID_ROLES as string[]).includes(r));
  return roles.length > 0 ? roles : ["OWNER"];
}

/** Cache-key-safe fragment capturing a scope's effect on what's fetched (docs/TODOS.md 10.3). */
export function repoScopeCacheKeySuffix(scope: RepoScopeOptions): string {
  if (scope.owner) return `owner:${scope.owner.toLowerCase()}`;
  return `role:${normalizeRoles(scope.role).join(",")}`;
}

export interface RawUserStats {
  name: string | null;
  login: string;
  avatarUrl: string;
  createdAt: string;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  totalRepos: number;
  totalPRs: number;
  mergedPRs: number;
  totalIssues: number;
  contributedTo: number;
  currentYearCommits: number;
  /** Only populated when include_all_commits is requested — a second, more expensive query. */
  allTimeCommits: number | null;
  reviews: number;
  discussionsStarted: number;
  discussionsAnswered: number;
  /** Distinct primary languages across the same first-100-owned-non-fork-repos window used elsewhere. */
  languageCount: number;
  organizationsCount: number;
}

interface UserStatsQueryResult {
  user: {
    name: string | null;
    login: string;
    avatarUrl: string;
    createdAt: string;
    followers: { totalCount: number };
    following: { totalCount: number };
    organizations: { totalCount: number };
    repositories: {
      totalCount: number;
      nodes: { stargazerCount: number; forkCount: number; primaryLanguage: { name: string } | null }[];
    };
    totalPRs: { totalCount: number };
    mergedPRs: { totalCount: number };
    openIssues: { totalCount: number };
    closedIssues: { totalCount: number };
    repositoriesContributedTo: { totalCount: number };
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestReviewContributions: number;
    };
    repositoryDiscussions: { totalCount: number };
    repositoryDiscussionComments: { totalCount: number };
  };
}

/**
 * `$from`/`$to` are nullable — omitted (docs/TODOS.md 10.3's `commits_year`
 * unset), GitHub's contributionsCollection defaults to the past 12 months,
 * matching prior behavior exactly.
 */
const USER_STATS_QUERY = `
  query($username: String!, $from: DateTime, $to: DateTime) {
    user(login: $username) {
      name
      login
      avatarUrl
      createdAt
      followers { totalCount }
      following { totalCount }
      organizations(first: 1) { totalCount }
      repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
        totalCount
        nodes { stargazerCount forkCount primaryLanguage { name } }
      }
      totalPRs: pullRequests(first: 1) { totalCount }
      mergedPRs: pullRequests(states: MERGED, first: 1) { totalCount }
      openIssues: issues(states: OPEN, first: 1) { totalCount }
      closedIssues: issues(states: CLOSED, first: 1) { totalCount }
      repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
        totalCount
      }
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestReviewContributions
      }
      repositoryDiscussions(first: 1) { totalCount }
      repositoryDiscussionComments(onlyAnswers: true, first: 1) { totalCount }
    }
  }
`;

/** Calendar-year UTC bounds for the `commits_year` scoping filter (docs/TODOS.md 10.3). */
function yearBounds(year: number): { from: string; to: string } {
  return {
    from: new Date(Date.UTC(year, 0, 1)).toISOString(),
    to: new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString(),
  };
}

/**
 * GitHub's contributionsCollection covers at most one year per call, so an
 * all-time commit total needs one aliased sub-query per year from account
 * creation to now — the same technique src/lib/github.ts uses for streak
 * history. Only run when include_all_commits is requested; it's a second
 * network round trip.
 */
async function fetchAllTimeCommits(username: string, createdAt: string): Promise<number> {
  const created = new Date(createdAt);
  const now = new Date();

  const ranges: { alias: string; from: Date; to: Date }[] = [];
  let windowStart = new Date(
    Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate())
  );

  while (windowStart < now) {
    const nextWindowStart = new Date(windowStart);
    nextWindowStart.setUTCFullYear(nextWindowStart.getUTCFullYear() + 1);
    const windowEnd = new Date(Math.min(nextWindowStart.getTime() - 1, now.getTime()));
    ranges.push({ alias: `y${ranges.length}`, from: windowStart, to: windowEnd });
    windowStart = nextWindowStart;
  }

  const yearFields = ranges
    .map(
      ({ alias, from, to }) =>
        `${alias}: contributionsCollection(from: "${from.toISOString()}", to: "${to.toISOString()}") { totalCommitContributions }`
    )
    .join("\n");

  const query = `query($username: String!) { user(login: $username) { ${yearFields} } }`;
  const data = await graphqlWithAuth<Record<string, unknown>>(query, { username });
  const user = data.user as Record<string, { totalCommitContributions: number }>;

  return ranges.reduce((sum, { alias }) => sum + user[alias].totalCommitContributions, 0);
}

export async function fetchUserStats(
  username: string,
  includeAllCommits: boolean,
  commitsYear?: number
): Promise<RawUserStats> {
  try {
    const bounds = commitsYear ? yearBounds(commitsYear) : { from: undefined, to: undefined };
    const data = await graphqlWithAuth<UserStatsQueryResult>(USER_STATS_QUERY, { username, ...bounds });
    const user = data.user;

    const totalStars = user.repositories.nodes.reduce((sum, repo) => sum + repo.stargazerCount, 0);
    const totalForks = user.repositories.nodes.reduce((sum, repo) => sum + repo.forkCount, 0);
    const allTimeCommits = includeAllCommits ? await fetchAllTimeCommits(username, user.createdAt) : null;
    const languageCount = new Set(
      user.repositories.nodes.map((repo) => repo.primaryLanguage?.name).filter((name): name is string => !!name)
    ).size;

    return {
      name: user.name,
      login: user.login,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      totalStars,
      totalForks,
      totalRepos: user.repositories.totalCount,
      totalPRs: user.totalPRs.totalCount,
      mergedPRs: user.mergedPRs.totalCount,
      totalIssues: user.openIssues.totalCount + user.closedIssues.totalCount,
      contributedTo: user.repositoriesContributedTo.totalCount,
      currentYearCommits: user.contributionsCollection.totalCommitContributions,
      allTimeCommits,
      reviews: user.contributionsCollection.totalPullRequestReviewContributions,
      discussionsStarted: user.repositoryDiscussions.totalCount,
      discussionsAnswered: user.repositoryDiscussionComments.totalCount,
      languageCount,
      organizationsCount: user.organizations.totalCount,
    };
  } catch (error) {
    throw wrapGithubError(error, "user stats");
  }
}

export interface RawLanguageEntry {
  name: string;
  color: string | null;
  size: number;
}

export interface RawLanguageData {
  repos: { name: string; languages: RawLanguageEntry[] }[];
}

interface LanguageStatsQueryResult {
  user: {
    repositories: {
      nodes: {
        name: string;
        languages: { edges: { size: number; node: { name: string; color: string | null } }[] } | null;
      }[];
    };
  };
}

function languageStatsQuery(roles: RepoRole[]): string {
  return `
    query($username: String!) {
      user(login: $username) {
        repositories(ownerAffiliations: [${roles.join(", ")}], isFork: false, first: 100) {
          nodes {
            name
            languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
              edges { size node { name color } }
            }
          }
        }
      }
    }
  `;
}

const LANGUAGE_STATS_ORG_QUERY = `
  query($login: String!) {
    organization(login: $login) {
      repositories(isFork: false, first: 100) {
        nodes {
          name
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name color } }
          }
        }
      }
    }
  }
`;

interface LanguageStatsOrgQueryResult {
  organization: LanguageStatsQueryResult["user"] | null;
}

/**
 * Language usage is scoped to the first 100 non-fork repositories matching
 * the requested scope — a GitHub API pagination limit shared by every
 * reference implementation (documented in docs/PLAN.md §8), not something
 * we can lift without multi-page fetching. `scope` (docs/TODOS.md 10.3)
 * defaults to the user's own OWNER-affiliated repos, matching prior
 * behavior exactly when left unset.
 */
export async function fetchLanguageData(username: string, scope: RepoScopeOptions = {}): Promise<RawLanguageData> {
  try {
    let nodes: LanguageStatsQueryResult["user"]["repositories"]["nodes"];
    if (scope.owner) {
      const data = await graphqlWithAuth<LanguageStatsOrgQueryResult>(LANGUAGE_STATS_ORG_QUERY, {
        login: scope.owner,
      });
      if (!data.organization) {
        throw new Error(`Organization "${scope.owner}" not found`);
      }
      nodes = data.organization.repositories.nodes;
    } else {
      const roles = normalizeRoles(scope.role);
      const data = await graphqlWithAuth<LanguageStatsQueryResult>(languageStatsQuery(roles), { username });
      nodes = data.user.repositories.nodes;
    }

    return {
      repos: nodes.map((repo) => ({
        name: repo.name,
        languages: (repo.languages?.edges ?? []).map((edge) => ({
          name: edge.node.name,
          color: edge.node.color,
          size: edge.size,
        })),
      })),
    };
  } catch (error) {
    throw wrapGithubError(error, "language data");
  }
}

export interface RawCommitLanguageEntry {
  name: string;
  color: string | null;
  commits: number;
}

export interface RawCommitLanguageData {
  entries: RawCommitLanguageEntry[];
}

interface CommitLanguageQueryResult {
  user: {
    repositories: {
      nodes: {
        primaryLanguage: { name: string; color: string | null } | null;
        defaultBranchRef: { target: { history: { totalCount: number } } | null } | null;
      }[];
    };
  };
}

function commitLanguageQuery(roles: RepoRole[]): string {
  return `
    query($username: String!) {
      user(login: $username) {
        repositories(ownerAffiliations: [${roles.join(", ")}], isFork: false, first: 100) {
          nodes {
            primaryLanguage { name color }
            defaultBranchRef {
              target {
                ... on Commit {
                  history { totalCount }
                }
              }
            }
          }
        }
      }
    }
  `;
}

const COMMIT_LANGUAGE_ORG_QUERY = `
  query($login: String!) {
    organization(login: $login) {
      repositories(isFork: false, first: 100) {
        nodes {
          primaryLanguage { name color }
          defaultBranchRef {
            target {
              ... on Commit {
                history { totalCount }
              }
            }
          }
        }
      }
    }
  }
`;

interface CommitLanguageOrgQueryResult {
  organization: CommitLanguageQueryResult["user"] | null;
}

/**
 * Commits-per-language (docs/TODOS.md 7.6): attributes each in-scope
 * non-fork repo's *entire* default-branch commit count to its primary
 * language. This is a deliberate simplification, not "commits literally
 * authored by this user" (that would require an author-filtered sub-query
 * per repo, a second round trip per repo) — a reasonable proxy given the
 * default scope is ownerAffiliations: OWNER, where the owner accounts for
 * nearly all commits in practice; widening `scope.role` to include
 * COLLABORATOR/ORGANIZATION_MEMBER repos weakens that assumption somewhat,
 * which is an accepted tradeoff of opting into the wider scope
 * (docs/TODOS.md 10.3). Same first-100-repos ceiling as language/repo
 * aggregation elsewhere in this file.
 */
export async function fetchCommitLanguageData(
  username: string,
  scope: RepoScopeOptions = {}
): Promise<RawCommitLanguageData> {
  try {
    let nodes: CommitLanguageQueryResult["user"]["repositories"]["nodes"];
    if (scope.owner) {
      const data = await graphqlWithAuth<CommitLanguageOrgQueryResult>(COMMIT_LANGUAGE_ORG_QUERY, {
        login: scope.owner,
      });
      if (!data.organization) {
        throw new Error(`Organization "${scope.owner}" not found`);
      }
      nodes = data.organization.repositories.nodes;
    } else {
      const roles = normalizeRoles(scope.role);
      const data = await graphqlWithAuth<CommitLanguageQueryResult>(commitLanguageQuery(roles), { username });
      nodes = data.user.repositories.nodes;
    }

    const entries: RawCommitLanguageEntry[] = [];
    for (const repo of nodes) {
      if (!repo.primaryLanguage) continue;
      const commits = repo.defaultBranchRef?.target?.history.totalCount ?? 0;
      if (commits === 0) continue;
      entries.push({ name: repo.primaryLanguage.name, color: repo.primaryLanguage.color, commits });
    }

    return { entries };
  } catch (error) {
    throw wrapGithubError(error, "commit-language data");
  }
}

export interface RawProductiveTimeData {
  /** UTC ISO commit timestamps, sampled from the user's most recently pushed repos. */
  commitDates: string[];
}

interface ProductiveTimeQueryResult {
  user: {
    repositories: {
      nodes: {
        defaultBranchRef: { target: { history: { nodes: { committedDate: string }[] } } | null } | null;
      }[];
    };
  };
}

const PRODUCTIVE_TIME_QUERY = `
  query($username: String!) {
    user(login: $username) {
      repositories(ownerAffiliations: OWNER, isFork: false, first: 20, orderBy: { field: PUSHED_AT, direction: DESC }) {
        nodes {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 100) { nodes { committedDate } }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Hour-of-day/day-of-week commit sample (docs/TODOS.md 7.7): the most
 * recent 100 default-branch commits from each of the user's 20
 * most-recently-pushed owned repos (up to 2000 timestamps) — not the
 * user's complete commit history (that would require paginating full
 * history across every repo, and isn't filtered to commits literally
 * authored by the user for the same reason documented on
 * fetchCommitLanguageData). A bounded, documented sample, same spirit as
 * the first-100-repos ceiling used elsewhere in this file.
 */
export async function fetchProductiveTimeData(username: string): Promise<RawProductiveTimeData> {
  try {
    const data = await graphqlWithAuth<ProductiveTimeQueryResult>(PRODUCTIVE_TIME_QUERY, { username });

    const commitDates: string[] = [];
    for (const repo of data.user.repositories.nodes) {
      const nodes = repo.defaultBranchRef?.target?.history.nodes ?? [];
      for (const node of nodes) commitDates.push(node.committedDate);
    }

    return { commitDates };
  } catch (error) {
    throw wrapGithubError(error, "productive-time data");
  }
}
