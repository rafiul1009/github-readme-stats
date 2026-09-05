/** Standard polar-to-cartesian conversion, 0deg = 12 o'clock, sweeping clockwise. */
export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// A start===end arc/wedge degenerates to a zero-length path, so any segment
// spanning (effectively) the whole circle is clamped just under 360deg —
// visually indistinguishable, and keeps the path commands well-defined.
const MAX_SWEEP = 359.99;

function clampSweep(startAngle: number, endAngle: number): number {
  return Math.min(endAngle, startAngle + MAX_SWEEP);
}

/** A solid pie wedge from the center, spanning [startAngle, endAngle) degrees. */
export function describePieSlice(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const clampedEnd = clampSweep(startAngle, endAngle);
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, clampedEnd);
  const largeArc = clampedEnd - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

/** An annular (donut) segment between innerR and outerR, spanning [startAngle, endAngle) degrees. */
export function describeDonutSlice(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  const clampedEnd = clampSweep(startAngle, endAngle);
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, clampedEnd);
  const startInner = polarToCartesian(cx, cy, innerR, clampedEnd);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = clampedEnd - startAngle > 180 ? 1 : 0;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}
