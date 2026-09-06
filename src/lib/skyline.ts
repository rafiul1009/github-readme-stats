import type { HeatmapCell } from "@/lib/heatmap";

/**
 * Isometric contribution "skyline" geometry (docs/TODOS.md 11.1 — a
 * from-scratch SVG-native alternative to the deferred 3D graph, see the
 * module doc on the widget's index.ts for why). Reuses the same
 * `HeatmapCell` grid the flat heatmap widget already builds — this is a
 * different projection of the identical data, not a different data model.
 */

export type IsoPoint = [number, number];

export interface SkylineTile {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  /** Top face, always 4 points (N E S W), even at level 0 (a flat diamond tile). */
  top: IsoPoint[];
  /** Side faces — null at level 0, where there's no extrusion to show a side of. */
  left: IsoPoint[] | null;
  right: IsoPoint[] | null;
  /** Painter's-algorithm draw order (back-to-front): lower depth first. */
  depth: number;
}

export interface SkylineLayout {
  tiles: SkylineTile[];
  width: number;
  height: number;
}

/**
 * Standard 2:1 isometric projection: a grid cell at (col, row) maps to
 * screen position ((col - row) * tw, (col + row) * th), with th = tw / 2.
 * Each cell is drawn as a hexagonal "cube" — a top diamond plus two visible
 * side faces — extruded upward by `levelHeight * cell.level`, the same
 * per-cell contribution-count bucket the flat heatmap uses.
 */
export function buildSkylineLayout(cells: HeatmapCell[], tileHalfWidth: number, levelHeight: number): SkylineLayout {
  const tw = tileHalfWidth;
  const th = tw / 2;

  interface RawTile {
    cell: HeatmapCell;
    top: IsoPoint[];
    left: IsoPoint[] | null;
    right: IsoPoint[] | null;
  }

  const rawTiles: RawTile[] = cells.map((cell) => {
    const groundX = (cell.weekIndex - cell.weekday) * tw;
    const groundY = (cell.weekIndex + cell.weekday) * th;
    const height = levelHeight * cell.level;
    const topY = groundY - height;

    const N: IsoPoint = [groundX, topY - th];
    const E: IsoPoint = [groundX + tw, topY];
    const S: IsoPoint = [groundX, topY + th];
    const W: IsoPoint = [groundX - tw, topY];
    const top: IsoPoint[] = [N, E, S, W];

    let left: IsoPoint[] | null = null;
    let right: IsoPoint[] | null = null;
    if (cell.level > 0) {
      const Wb: IsoPoint = [groundX - tw, groundY];
      const Sb: IsoPoint = [groundX, groundY + th];
      const Eb: IsoPoint = [groundX + tw, groundY];
      left = [W, S, Sb, Wb];
      right = [S, E, Eb, Sb];
    }

    return { cell, top, left, right };
  });

  const allPoints: IsoPoint[] = rawTiles.flatMap((t) => [...t.top, ...(t.left ?? []), ...(t.right ?? [])]);
  const xs = allPoints.map((p) => p[0]);
  const ys = allPoints.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const shift = ([x, y]: IsoPoint): IsoPoint => [x - minX, y - minY];

  const tiles: SkylineTile[] = rawTiles
    .map(({ cell, top, left, right }) => ({
      date: cell.date,
      count: cell.count,
      level: cell.level,
      top: top.map(shift),
      left: left ? left.map(shift) : null,
      right: right ? right.map(shift) : null,
      depth: cell.weekIndex + cell.weekday,
    }))
    .sort((a, b) => a.depth - b.depth);

  return {
    tiles,
    width: maxX - minX,
    height: maxY - minY,
  };
}

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

/**
 * Multiplies a 6-digit hex color's RGB channels by `factor` (clamped to
 * 0-255) — cheap, theme-independent isometric-cube shading (top full
 * brightness, sides darker) that works the same regardless of the
 * surrounding page's background. Non-hex input (a CSS name, a gradient
 * override) is returned unchanged rather than guessed at.
 */
export function shadeHex(color: string, factor: number): string {
  const match = HEX_RE.exec(color);
  if (!match) return color;
  const channel = (offset: number) => {
    const value = Math.round(parseInt(match[1].slice(offset, offset + 2), 16) * factor);
    return Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0");
  };
  return `#${channel(0)}${channel(2)}${channel(4)}`;
}
