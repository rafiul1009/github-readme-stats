/**
 * Rank calculation (docs/PLAN.md §7 D6 — adopt the established weighted-
 * percentile-of-CDFs approach rather than inventing a new one, so our rank
 * doesn't disagree with a rank a user already has elsewhere).
 *
 * Each metric is passed through a CDF that approaches 1 as the metric grows
 * (exponential for count-like metrics that grow steadily with activity;
 * log-normal for metrics — stars, followers — that are extremely
 * right-skewed, where a handful of viral repos shouldn't by themselves
 * saturate the score). The weighted average of those CDFs is inverted into
 * a 0-100 percentile where LOWER is better, matching the conventional
 * "percentile 0 = top of the class" meaning, then bucketed into a letter
 * grade. The exact medians/weights below are ours (published here, not
 * lifted from unverifiable upstream source), but the *shape* of the
 * calculation is the same weighted-CDF technique this ecosystem uses.
 */

export interface RankInput {
  commits: number;
  prs: number;
  issues: number;
  reviews: number;
  stars: number;
  followers: number;
}

export interface RankResult {
  level: string;
  /** 0-100, lower is better. */
  percentile: number;
}

interface MetricConfig {
  median: number;
  weight: number;
  /** 'exponential' for steadily-accumulating counts; 'logNormal' for heavily right-skewed metrics. */
  distribution: "exponential" | "logNormal";
}

const METRICS: Record<keyof RankInput, MetricConfig> = {
  commits: { median: 250, weight: 2, distribution: "exponential" },
  prs: { median: 50, weight: 3, distribution: "exponential" },
  issues: { median: 25, weight: 1, distribution: "exponential" },
  reviews: { median: 2, weight: 1, distribution: "exponential" },
  stars: { median: 50, weight: 4, distribution: "logNormal" },
  followers: { median: 10, weight: 1, distribution: "logNormal" },
};

const TOTAL_WEIGHT = Object.values(METRICS).reduce((sum, m) => sum + m.weight, 0);

// Ascending percentile thresholds mapped to descending letter quality — the
// LOWEST percentile bucket gets the BEST letter.
const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

function exponentialCdf(x: number): number {
  return 1 - Math.pow(2, -x);
}

function logNormalCdf(x: number): number {
  return x / (1 + x);
}

export function calculateRank(input: RankInput): RankResult {
  let weightedSum = 0;

  for (const key of Object.keys(METRICS) as (keyof RankInput)[]) {
    const { median, weight, distribution } = METRICS[key];
    const normalized = Math.max(input[key], 0) / median;
    const cdf = distribution === "exponential" ? exponentialCdf(normalized) : logNormalCdf(normalized);
    weightedSum += weight * cdf;
  }

  const percentile = (1 - weightedSum / TOTAL_WEIGHT) * 100;
  const clamped = Math.min(Math.max(percentile, 0), 100);
  const level = LEVELS[THRESHOLDS.findIndex((t) => clamped <= t)] ?? LEVELS[LEVELS.length - 1];

  return { level, percentile: clamped };
}
