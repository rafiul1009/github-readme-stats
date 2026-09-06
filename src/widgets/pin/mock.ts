import type { RawRepoData } from "@/lib/githubRepo";

/** Sample repo data used by the builder's live preview — no GitHub API call. */
export function getMockRepoData(): RawRepoData {
  return {
    name: "sample-project",
    owner: "sample-user",
    description:
      "A sample repository description, long enough to demonstrate how the card wraps text across multiple lines.",
    isArchived: false,
    isTemplate: false,
    isFork: false,
    stars: 1240,
    forks: 213,
    language: { name: "TypeScript", color: "#3178c6" },
    issues: 18,
    pullRequests: 6,
    watchers: 42,
    sizeKb: 8420,
  };
}
