import { getMockUserStats } from "@/widgets/stats/mock";
import { getMockRepoData } from "@/widgets/pin/mock";
import type { RawUserStats } from "@/lib/githubStats";
import type { RawRepoData } from "@/lib/githubRepo";

export interface RawBadgesData {
  userStats?: RawUserStats;
  repoData?: RawRepoData & { contributors?: number };
}

export function getMockBadgesData(): RawBadgesData {
  return {
    userStats: getMockUserStats(),
    repoData: { ...getMockRepoData(), contributors: 14 },
  };
}
