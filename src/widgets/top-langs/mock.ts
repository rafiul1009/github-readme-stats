import type { RawLanguageData } from "@/lib/githubStats";

/** Sample per-repo language data used by the builder's live preview — no GitHub API call. */
export function getMockLanguageData(): RawLanguageData {
  return {
    repos: [
      {
        name: "repo-one",
        languages: [
          { name: "TypeScript", color: "#3178c6", size: 82000 },
          { name: "CSS", color: "#663399", size: 12000 },
        ],
      },
      {
        name: "repo-two",
        languages: [
          { name: "JavaScript", color: "#f1e05a", size: 65000 },
          { name: "HTML", color: "#e34c26", size: 8000 },
        ],
      },
      { name: "repo-three", languages: [{ name: "Python", color: "#3572A5", size: 54000 }] },
      {
        name: "repo-four",
        languages: [
          { name: "TypeScript", color: "#3178c6", size: 30000 },
          { name: "Go", color: "#00ADD8", size: 21000 },
        ],
      },
      { name: "repo-five", languages: [{ name: "Rust", color: "#dea584", size: 15000 }] },
    ],
  };
}
