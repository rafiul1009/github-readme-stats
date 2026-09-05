/**
 * Fallback color lookup for languages reported only by name (no color), as
 * the Gists REST API does — GraphQL's `primaryLanguage.color` isn't
 * available there. Values match GitHub's own linguist palette for the most
 * common languages; anything missing falls back to a neutral gray.
 */
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  HTML: "#e34c26",
  CSS: "#663399",
  SCSS: "#c6538c",
  Shell: "#89e051",
  Markdown: "#083fa1",
  JSON: "#292929",
  YAML: "#cb171e",
  Dockerfile: "#384d54",
  Vue: "#41b883",
  Dart: "#00B4AB",
  Lua: "#000080",
  Perl: "#0298c3",
  Haskell: "#5e5086",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
};

const FALLBACK_COLOR = "#858585";

export function getLanguageColor(name: string | null | undefined): string {
  if (!name) return FALLBACK_COLOR;
  return LANGUAGE_COLORS[name] ?? FALLBACK_COLOR;
}
