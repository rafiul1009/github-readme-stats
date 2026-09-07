/**
 * Profilecraft's card-stack mark (docs/TODOS.md 12.26 / PLAN.md §10).
 *
 * Three offset rounded rectangles — a literal depiction of what a profile
 * README is: a stack of cards. Separation between the cards is cut with a
 * mask rather than drawn with a stroke, so the gaps stay the same visual
 * width at any size and the mark never needs a background to read against.
 *
 * `currentColor` drives the two rear cards and `--color-brand` the front
 * one, so the mark re-themes with the app in light and dark without a
 * second asset.
 */

interface Card {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
}

/**
 * Cards grow toward the front, so each one fully covers the card behind it.
 * That is what makes the mask cut clean: if a rear card were the wider of the
 * pair it would poke out past the punched-out silhouette as a stray tab.
 * It also reads as perspective — the nearest card is the largest.
 * Mirrored by the static icon files in src/app/.
 */
const CARDS: Card[] = [
  { x: 7.5, y: 3.5, w: 17, h: 9.5, rx: 2.75 }, // back
  { x: 6.5, y: 10, w: 19, h: 10.5, rx: 3 }, // middle
  { x: 5.5, y: 17, w: 21, h: 11.5, rx: 3.25 }, // front (accent)
];

/** Two thicker cards for favicon sizes — the three-card mark muddies below ~24px. */
const COMPACT_CARDS: Card[] = [
  { x: 7, y: 5.75, w: 18, h: 10, rx: 3 },
  { x: 5, y: 14.25, w: 22, h: 12, rx: 3.5 },
];

/** How far a card's silhouette is grown before being punched out of the card behind it. */
const GAP = 1.5;

export interface LogoProps {
  /** Rendered pixel size; the mark is authored on a 32x32 grid. */
  size?: number;
  /** The compact two-card cut, for 16-24px rendering. */
  compact?: boolean;
  className?: string;
  /** Supplying a title makes the mark an announced image; omitting it hides it from AT. */
  title?: string;
}

export function Logo({ size = 32, compact = false, className, title }: LogoProps) {
  const cards = compact ? COMPACT_CARDS : CARDS;
  // A deterministic prefix rather than useId(), so the mark stays a Server
  // Component. Two Logos of the same variant emit identical mask definitions,
  // so the resulting id collision resolves to an identical mask — harmless.
  const uid = compact ? "pc-mark-c" : "pc-mark";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <defs>
        {cards.slice(0, -1).map((_, i) => (
          <mask key={i} id={`${uid}-cut-${i}`}>
            <rect width="32" height="32" fill="#fff" />
            {cards.slice(i + 1).map((c, j) => (
              <rect
                key={j}
                x={c.x - GAP}
                y={c.y - GAP}
                width={c.w + GAP * 2}
                height={c.h + GAP * 2}
                rx={c.rx + GAP}
                fill="#000"
              />
            ))}
          </mask>
        ))}
      </defs>

      {cards.map((c, i) => {
        const isFront = i === cards.length - 1;
        return (
          <rect
            key={i}
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            rx={c.rx}
            fill={isFront ? "var(--color-brand, #7c5cff)" : "currentColor"}
            opacity={isFront ? 1 : 0.32 + i * 0.22}
            mask={isFront ? undefined : `url(#${uid}-cut-${i})`}
          />
        );
      })}
    </svg>
  );
}

export interface WordmarkProps {
  size?: number;
  className?: string;
}

/** Mark + name lockup for the dashboard's top bar. */
export function Wordmark({ size = 28, className }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Logo size={size} title="Profilecraft" />
      <span className="font-semibold tracking-tight" style={{ fontSize: size * 0.58 }}>
        Profilecraft
      </span>
    </span>
  );
}
