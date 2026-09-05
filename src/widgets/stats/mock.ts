import type { RawUserStats } from "@/lib/githubStats";

/** Sample stats used by the builder's live preview — no GitHub API call. */
export function getMockUserStats(): RawUserStats {
  return {
    name: "Sample User",
    login: "sample-user",
    createdAt: "2018-04-12T00:00:00Z",
    followers: 842,
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
  };
}
