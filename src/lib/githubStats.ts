import { graphql } from "@octokit/graphql";

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
});

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

const USER_STATS_QUERY = `
  query($username: String!) {
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
      contributionsCollection {
        totalCommitContributions
        totalPullRequestReviewContributions
      }
      repositoryDiscussions(first: 1) { totalCount }
      repositoryDiscussionComments(onlyAnswers: true, first: 1) { totalCount }
    }
  }
`;

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

export async function fetchUserStats(username: string, includeAllCommits: boolean): Promise<RawUserStats> {
  try {
    const data = await graphqlWithAuth<UserStatsQueryResult>(USER_STATS_QUERY, { username });
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
    if (error instanceof Error) {
      throw new Error(`Failed to fetch user stats: ${error.message}`);
    }
    throw error;
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

const LANGUAGE_STATS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
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

/**
 * Language usage is scoped to a user's own first 100 non-fork repositories
 * — a GitHub API pagination limit shared by every reference implementation
 * (documented in docs/PLAN.md §8), not something we can lift without
 * multi-page fetching across a user's entire repo history.
 */
export async function fetchLanguageData(username: string): Promise<RawLanguageData> {
  try {
    const data = await graphqlWithAuth<LanguageStatsQueryResult>(LANGUAGE_STATS_QUERY, { username });

    return {
      repos: data.user.repositories.nodes.map((repo) => ({
        name: repo.name,
        languages: (repo.languages?.edges ?? []).map((edge) => ({
          name: edge.node.name,
          color: edge.node.color,
          size: edge.size,
        })),
      })),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch language data: ${error.message}`);
    }
    throw error;
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

const COMMIT_LANGUAGE_QUERY = `
  query($username: String!) {
    user(login: $username) {
      repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
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

/**
 * Commits-per-language (docs/TODOS.md 7.6): attributes each owned non-fork
 * repo's *entire* default-branch commit count to its primary language.
 * This is a deliberate simplification, not "commits literally authored by
 * this user" (that would require an author-filtered sub-query per repo, a
 * second round trip per repo) — a reasonable proxy given the repos are all
 * ownerAffiliations: OWNER, where the owner accounts for nearly all commits
 * in practice. Same first-100-repos ceiling as language/repo aggregation
 * elsewhere in this file.
 */
export async function fetchCommitLanguageData(username: string): Promise<RawCommitLanguageData> {
  try {
    const data = await graphqlWithAuth<CommitLanguageQueryResult>(COMMIT_LANGUAGE_QUERY, { username });

    const entries: RawCommitLanguageEntry[] = [];
    for (const repo of data.user.repositories.nodes) {
      if (!repo.primaryLanguage) continue;
      const commits = repo.defaultBranchRef?.target?.history.totalCount ?? 0;
      if (commits === 0) continue;
      entries.push({ name: repo.primaryLanguage.name, color: repo.primaryLanguage.color, commits });
    }

    return { entries };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch commit-language data: ${error.message}`);
    }
    throw error;
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
    if (error instanceof Error) {
      throw new Error(`Failed to fetch productive-time data: ${error.message}`);
    }
    throw error;
  }
}
