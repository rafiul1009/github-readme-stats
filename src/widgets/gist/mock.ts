import type { RawGistData } from "@/lib/githubRepo";

/** Sample gist data used by the builder's live preview — no GitHub API call. */
export function getMockGistData(): RawGistData {
  return {
    id: "sample-gist-id",
    owner: "sample-user",
    description: "A sample gist with a couple of files",
    files: [
      { filename: "index.ts", language: "TypeScript" },
      { filename: "README.md", language: "Markdown" },
    ],
  };
}
