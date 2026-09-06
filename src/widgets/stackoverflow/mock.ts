import type { StackOverflowStats } from "@/lib/stackoverflow";

export function getMockStackOverflowStats(): StackOverflowStats {
  return {
    displayName: "Octocat",
    reputation: 64189,
    badgeCounts: { gold: 48, silver: 154, bronze: 153 },
    profileUrl: "https://stackoverflow.com/users/1/octocat",
  };
}
