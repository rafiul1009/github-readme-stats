import type { RawCommitLanguageData } from "@/lib/githubStats";

/** Sample per-repo commit-language data used by the builder's live preview — no GitHub API call. */
export function getMockCommitLanguageData(): RawCommitLanguageData {
  return {
    entries: [
      { name: "TypeScript", color: "#3178c6", commits: 1240 },
      { name: "JavaScript", color: "#f1e05a", commits: 640 },
      { name: "Python", color: "#3572A5", commits: 410 },
      { name: "Go", color: "#00ADD8", commits: 260 },
      { name: "Rust", color: "#dea584", commits: 90 },
    ],
  };
}
