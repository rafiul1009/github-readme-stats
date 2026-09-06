import type { ReactNode } from "react";

export interface RtlMirrorProps {
  /** The element's own local x-coordinate (its `x`/`cx`, or a wrapping group's own translate-x). */
  x: number;
  rtl?: boolean;
  children: ReactNode;
}

/**
 * Counter-mirrors a subtree anchored at local x-coordinate `x` so that, once
 * `<Card rtl>` mirrors the whole card horizontally, this subtree's glyphs
 * and icon shapes render normally while their *position* still moves to the
 * opposite side — "mirror positions, not just strings" (docs/PLAN.md §4,
 * task 5.3).
 *
 * Composing two reflections about x (Card's card-wide flip + this local
 * one) cancels the visual flip and leaves only the position change, and
 * that cancellation holds regardless of how many pure-translation groups
 * sit between this node and Card's flip (translation doesn't reintroduce a
 * sign flip) — so it's safe to wrap directly around any positioned element
 * or group, using that element's own x/cx as the anchor.
 */
export function RtlMirror({ x, rtl = false, children }: RtlMirrorProps) {
  if (!rtl) return <>{children}</>;
  return <g transform={`translate(${2 * x}, 0) scale(-1, 1)`}>{children}</g>;
}
