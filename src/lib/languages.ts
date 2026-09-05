import type { RawLanguageData } from "@/lib/githubStats";

export interface LanguageStat {
  name: string;
  color: string;
  size: number;
  repoCount: number;
  /** Share of the ranked total, 0-100. With the default weights this is a plain byte-size percentage. */
  percentage: number;
}

export interface AggregateLanguagesOptions {
  excludeRepos?: string[];
  hide?: string[];
  /** Ranking: (bytes ^ sizeWeight) * (repoCount ^ countWeight). Defaults to pure byte-size ranking. */
  sizeWeight?: number;
  countWeight?: number;
}

const FALLBACK_COLOR = "#858585";

/**
 * Aggregates per-repo language bytes into a single ranked list (docs/TODOS.md
 * 2.4/2.5). The ranking score also doubles as the percentage basis, so
 * `count_weight > 0` changes not just ordering but the displayed split.
 */
export function aggregateLanguages(
  data: RawLanguageData,
  options: AggregateLanguagesOptions = {}
): LanguageStat[] {
  const excludeRepos = new Set((options.excludeRepos ?? []).map((r) => r.toLowerCase()));
  const hide = new Set((options.hide ?? []).map((l) => l.toLowerCase()));
  const sizeWeight = options.sizeWeight ?? 1;
  const countWeight = options.countWeight ?? 0;

  const byLanguage = new Map<string, { color: string; size: number; repoCount: number }>();

  for (const repo of data.repos) {
    if (excludeRepos.has(repo.name.toLowerCase())) continue;

    for (const lang of repo.languages) {
      if (hide.has(lang.name.toLowerCase())) continue;

      const existing = byLanguage.get(lang.name);
      if (existing) {
        existing.size += lang.size;
        existing.repoCount += 1;
      } else {
        byLanguage.set(lang.name, { color: lang.color ?? FALLBACK_COLOR, size: lang.size, repoCount: 1 });
      }
    }
  }

  const ranked = Array.from(byLanguage.entries()).map(([name, v]) => ({
    name,
    color: v.color,
    size: v.size,
    repoCount: v.repoCount,
    rankScore: Math.pow(v.size, sizeWeight) * Math.pow(v.repoCount, countWeight),
  }));

  ranked.sort((a, b) => b.rankScore - a.rankScore);

  const totalRankScore = ranked.reduce((sum, e) => sum + e.rankScore, 0) || 1;

  return ranked.map((e) => ({
    name: e.name,
    color: e.color,
    size: e.size,
    repoCount: e.repoCount,
    percentage: (e.rankScore / totalRankScore) * 100,
  }));
}
