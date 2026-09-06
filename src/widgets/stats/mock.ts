import type { RawUserStats } from "@/lib/githubStats";

/** Sample stats used by the builder's live preview — no GitHub API call. */
export function getMockUserStats(): RawUserStats {
  return {
    name: "Sample User",
    login: "sample-user",
    avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
    createdAt: "2011-06-02T00:00:00Z",
    followers: 842,
    following: 96,
    totalStars: 3210,
    totalForks: 512,
    totalRepos: 47,
    totalPRs: 386,
    mergedPRs: 340,
    totalIssues: 128,
    contributedTo: 22,
    currentYearCommits: 940,
    allTimeCommits: 4870,
    reviews: 65,
    discussionsStarted: 9,
    discussionsAnswered: 14,
    languageCount: 12,
    organizationsCount: 4,
  };
}
