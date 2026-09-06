import { monthShortLabel } from "@/lib/i18n";

export interface HeatmapCell {
  date: string;
  count: number;
  /** Quantized 0-4 bucket (0 = no contributions), for a GitHub-style 5-shade scale. */
  level: 0 | 1 | 2 | 3 | 4;
  weekIndex: number;
  /** 0 = Sunday .. 6 = Saturday. */
  weekday: number;
}

export interface HeatmapMonthLabel {
  weekIndex: number;
  label: string;
}

export interface HeatmapGrid {
  cells: HeatmapCell[];
  weekCount: number;
  monthLabels: HeatmapMonthLabel[];
  maxCount: number;
}

/**
 * Builds a GitHub-style calendar grid (task 6.2): `weeks` full Sun-Sat
 * columns ending on the current week, quantized into a 5-level color scale
 * by quartiles of non-zero days (so the scale adapts to how active this
 * particular user is, rather than fixed absolute thresholds that would
 * make a light user's card look empty or a heavy user's look saturated).
 */
export function buildHeatmapGrid(
  contributionDays: { date: string; contributionCount: number }[],
  weeks: number,
  locale: string
): HeatmapGrid {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  endOfWeek.setUTCDate(endOfWeek.getUTCDate() + (6 - endOfWeek.getUTCDay()));

  const totalDays = weeks * 7;
  const start = new Date(endOfWeek);
  start.setUTCDate(start.getUTCDate() - totalDays + 1);

  const byDate = new Map(contributionDays.map((d) => [d.date, d.contributionCount]));

  const cells: HeatmapCell[] = [];
  for (let i = 0; i < totalDays; i += 1) {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + i);
    if (date > today) break;

    const key = date.toISOString().slice(0, 10);
    const count = byDate.get(key) ?? 0;
    cells.push({
      date: key,
      count,
      level: 0,
      weekIndex: Math.floor(i / 7),
      weekday: date.getUTCDay(),
    });
  }

  const nonZero = cells
    .map((c) => c.count)
    .filter((c) => c > 0)
    .sort((a, b) => a - b);
  const thresholdAt = (p: number) => nonZero[Math.min(nonZero.length - 1, Math.floor(p * nonZero.length))] ?? 0;
  const thresholds: [number, number, number] = nonZero.length > 0 ? [thresholdAt(0.25), thresholdAt(0.5), thresholdAt(0.75)] : [1, 2, 3];

  for (const cell of cells) {
    if (cell.count === 0) cell.level = 0;
    else if (cell.count <= thresholds[0]) cell.level = 1;
    else if (cell.count <= thresholds[1]) cell.level = 2;
    else if (cell.count <= thresholds[2]) cell.level = 3;
    else cell.level = 4;
  }

  const weekCount = cells.length === 0 ? 0 : Math.floor((cells[cells.length - 1].weekIndex ?? 0)) + 1;

  const monthLabels: HeatmapMonthLabel[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weekCount; w += 1) {
    const firstCellOfWeek = cells.find((c) => c.weekIndex === w);
    if (!firstCellOfWeek) continue;
    const date = new Date(`${firstCellOfWeek.date}T00:00:00Z`);
    const month = date.getUTCMonth();
    if (month !== lastMonth) {
      monthLabels.push({ weekIndex: w, label: monthShortLabel(date, locale) });
      lastMonth = month;
    }
  }

  return {
    cells,
    weekCount,
    monthLabels,
    maxCount: cells.reduce((max, c) => Math.max(max, c.count), 0),
  };
}
