import type { SVGProps } from "react";

export interface DrawOnPathProps extends Omit<SVGProps<SVGPathElement>, "d"> {
  d: string;
  disabled?: boolean;
  /** Animation duration, in seconds. */
  duration?: number;
  /** Animation start delay, in seconds. */
  delay?: number;
}

/**
 * A stroked path that "draws itself" on load (task 6.4's opt-in draw-on
 * animation), via a plain SVG `<animate>` rather than a CSS `@keyframes`
 * block — this is the one place in the app that needs it, since the effect
 * relies on `pathLength` normalization: setting `pathLength={100}` makes
 * `stroke-dasharray`/`stroke-dashoffset` work in percent-of-path-length
 * regardless of the path's actual on-screen geometry, so the same "100 to
 * 0" animation draws correctly no matter how long or curvy `d` is.
 *
 * `disabled` (disable_animations, or PNG rasterization — a static image has
 * no meaningful "on load") renders the path fully drawn with no animation
 * element at all.
 */
export function DrawOnPath({ d, disabled = false, duration = 1.2, delay = 0, ...rest }: DrawOnPathProps) {
  if (disabled) {
    return <path d={d} {...rest} />;
  }

  return (
    <path d={d} pathLength={100} strokeDasharray={100} strokeDashoffset={100} {...rest}>
      <animate attributeName="stroke-dashoffset" from="100" to="0" dur={`${duration}s`} begin={`${delay}s`} fill="freeze" />
    </path>
  );
}
