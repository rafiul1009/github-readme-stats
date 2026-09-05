import { graphql } from "@octokit/graphql";

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
});

export interface RawUserStats {
  name: string | null;
  login: string;
  createdAt: string;
  followers: number;
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
}

interface UserStatsQueryResult {
  user: {
    name: string | null;
    login: string;
    createdAt: string;
    followers: { totalCount: number };
    repositories: { totalCount: number; nodes: { stargazerCount: number; forkCount: number }[] };
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
      createdAt
      followers { totalCount }
      repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
        totalCount
        nodes { stargazerCount forkCount }
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

    return {
      name: user.name,
      login: user.login,
      createdAt: user.createdAt,
      followers: user.followers.totalCount,
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
