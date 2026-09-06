import type { NpmPackageStats } from "@/lib/npmStats";

export function getMockNpmStats(): NpmPackageStats {
  return { name: "react", version: "19.2.0", weeklyDownloads: 34281940 };
}
