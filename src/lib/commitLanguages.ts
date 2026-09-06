import type { RawCommitLanguageData } from "@/lib/githubStats";

export interface CommitLanguageStat {
  name: string;
  color: string;
  commits: number;
  percentage: number;
}

const FALLBACK_COLOR = "#858585";

/** Aggregates per-repo commit counts into a ranked per-language list (docs/TODOS.md 7.6). */
export function aggregateCommitLanguages(data: RawCommitLanguageData, hide: string[] = []): CommitLanguageStat[] {
  const hideSet = new Set(hide.map((l) => l.toLowerCase()));
  const byLanguage = new Map<string, { color: string; commits: number }>();

  for (const entry of data.entries) {
    if (hideSet.has(entry.name.toLowerCase())) continue;
    const existing = byLanguage.get(entry.name);
    if (existing) {
      existing.commits += entry.commits;
    } else {
      byLanguage.set(entry.name, { color: entry.color ?? FALLBACK_COLOR, commits: entry.commits });
    }
  }

  const totalCommits = Array.from(byLanguage.values()).reduce((sum, v) => sum + v.commits, 0) || 1;

  return Array.from(byLanguage.entries())
    .map(([name, v]) => ({ name, color: v.color, commits: v.commits, percentage: (v.commits / totalCommits) * 100 }))
    .sort((a, b) => b.commits - a.commits);
}
