import { graphql } from '@octokit/graphql';

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: {
    contributionDays: ContributionDay[];
  }[];
}

export interface FullContributionData {
  createdAt: string;
  totalContributions: number;
  contributionDays: ContributionDay[];
}

interface UserCreatedAtData {
  user: {
    createdAt: string;
  };
}

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
});

function toISODate(date: Date): string {
  return date.toISOString();
}

/**
 * GitHub's contributionsCollection only accepts ranges of at most one year, so
 * fetching a user's full history requires one aliased sub-query per year from
 * account creation to now, combined into a single GraphQL request.
 */
export async function fetchContributionData(username: string): Promise<FullContributionData> {
  try {
    const createdAtQuery = `
      query($username: String!) {
        user(login: $username) {
          createdAt
        }
      }
    `;

    const createdAtData = await graphqlWithAuth<UserCreatedAtData>(createdAtQuery, { username });
    const createdAt = new Date(createdAtData.user.createdAt);
    const now = new Date();

    // Day-aligned, non-overlapping year windows: each window ends the day
    // before the next one starts, so no calendar day is ever double-counted.
    const ranges: { alias: string; from: Date; to: Date }[] = [];
    let windowStart = new Date(
      Date.UTC(createdAt.getUTCFullYear(), createdAt.getUTCMonth(), createdAt.getUTCDate())
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
        ({ alias, from, to }) => `
          ${alias}: contributionsCollection(from: "${toISODate(from)}", to: "${toISODate(to)}") {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        `
      )
      .join('\n');

    const query = `
      query($username: String!) {
        user(login: $username) {
          ${yearFields}
        }
      }
    `;

    const data = await graphqlWithAuth<Record<string, unknown>>(query, { username });
    const user = data.user as Record<string, { contributionCalendar: ContributionCalendar }>;

    let totalContributions = 0;
    const contributionDays: ContributionDay[] = [];

    for (const { alias } of ranges) {
      const calendar = user[alias].contributionCalendar;
      totalContributions += calendar.totalContributions;
      for (const week of calendar.weeks) {
        contributionDays.push(...week.contributionDays);
      }
    }

    return {
      createdAt: createdAtData.user.createdAt,
      totalContributions,
      contributionDays,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch contribution data: ${error.message}`);
    }
    throw error;
  }
}
