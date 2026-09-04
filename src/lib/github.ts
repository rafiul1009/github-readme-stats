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

interface UserData {
  user: {
    contributionsCollection: {
      contributionCalendar: ContributionCalendar;
    };
  };
}

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
});

export async function fetchContributionData(username: string): Promise<ContributionCalendar> {
  try {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
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
        }
      }
    `;

    const data = await graphqlWithAuth<UserData>(query, { username });
    return data.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch contribution data: ${error.message}`);
    }
    throw error;
  }
}