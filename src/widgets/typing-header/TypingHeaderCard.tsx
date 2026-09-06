import { Card } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { estimateTextWidthPx } from "@/lib/textWidth";

export interface TypingHeaderCardOverrides {
  background?: string;
  border?: string;
  text?: string;
  cursor?: string;
}

export interface TypingHeaderCardProps {
  lines: string[];
  font: string;
  size: number;
  duration: number;
  pause: number;
  multiline: boolean;
  hideCursor: boolean;
  theme: ThemeDefinition;
  overrides?: TypingHeaderCardOverrides;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
  height?: number;
}

const PADDING = 16;
const ROW_HEIGHT_FACTOR = 1.7;

/** A single (time, value) keyframe point, in absolute seconds. */
type Point = [number, number];

/** Collapses consecutive equal-time points (keeping the later value), then formats as SMIL keyTimes/values strings. */
function buildKeyframes(points: Point[], totalDuration: number): { keyTimes: string; values: string } {
  const deduped: Point[] = [];
  for (const [t, v] of points) {
    if (deduped.length > 0 && deduped[deduped.length - 1][0] === t) {
      deduped[deduped.length - 1] = [t, v];
    } else {
      deduped.push([t, v]);
    }
  }
  return {
    keyTimes: deduped.map(([t]) => Math.min(t / totalDuration, 1).toFixed(4)).join(";"),
    values: deduped.map(([, v]) => v.toFixed(2)).join(";"),
  };
}

export function TypingHeaderCard({
  lines,
  font,
  size,
  duration,
  pause,
  multiline,
  hideCursor,
  theme,
  overrides = {},
  disableAnimations = false,
  hideBorder = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = 500,
  height = 60,
}: TypingHeaderCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "text", "accent"] as const, {
    border: normalizeOverrideColor(overrides.border),
    text: normalizeOverrideColor(overrides.text),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const textColor = overrides.text ?? colors.accent;
  const cursorColor = overrides.cursor ?? colors.accent;

  const shownLines = lines.length > 0 ? lines : ["Hello, world!"];
  const lineWidths = shownLines.map((line) => estimateTextWidthPx(line, size));
  const typeSec = duration / 1000;
  const pauseSec = pause / 1000;
  const rowHeight = size * ROW_HEIGHT_FACTOR;

  let content: React.ReactNode;
  let cardHeight = height;

  if (disableAnimations) {
    // A static single frame — the fully-typed final state, matching the DrawOnPath
    // convention (disable_animations renders the base/finished state, not frame zero).
    const displayLines = multiline ? shownLines : [shownLines[shownLines.length - 1]];
    cardHeight = multiline ? Math.max(height, PADDING * 2 + shownLines.length * rowHeight) : height;
    content = (
      <>
        {displayLines.map((line, i) => (
          <text
            key={i}
            x={PADDING}
            y={(multiline ? PADDING + rowHeight * (i + 1) - rowHeight * 0.3 : cardHeight / 2 + size * 0.35)}
            fill={textColor}
            fontFamily={font}
            fontSize={size}
          >
            {line}
          </text>
        ))}
      </>
    );
  } else if (multiline) {
    cardHeight = Math.max(height, PADDING * 2 + shownLines.length * rowHeight);

    let cursor = 0;
    const starts: number[] = [];
    for (let i = 0; i < shownLines.length; i += 1) {
      starts.push(cursor);
      cursor += typeSec + pauseSec;
    }
    const totalTyping = cursor;
    const lastLineIndex = shownLines.length - 1;
    const lastRowY = PADDING + rowHeight * (lastLineIndex + 1) - rowHeight * 0.3;
    const lastLineWidth = lineWidths[lastLineIndex] ?? 0;

    content = (
      <>
        <defs>
          {shownLines.map((_, i) => {
            const rowY = PADDING + rowHeight * (i + 1) - rowHeight * 0.3;
            return (
              <clipPath id={`typing-line-${i}`} key={i}>
                <rect x={PADDING} y={rowY - size} width={0} height={size * 1.4}>
                  <animate
                    attributeName="width"
                    begin={`${starts[i]}s`}
                    dur={`${typeSec}s`}
                    values={`0;${lineWidths[i] + 4}`}
                    fill="freeze"
                  />
                </rect>
              </clipPath>
            );
          })}
        </defs>
        {shownLines.map((line, i) => {
          const rowY = PADDING + rowHeight * (i + 1) - rowHeight * 0.3;
          return (
            <g key={i} clipPath={`url(#typing-line-${i})`}>
              <text x={PADDING} y={rowY} fill={textColor} fontFamily={font} fontSize={size}>
                {line}
              </text>
            </g>
          );
        })}
        {!hideCursor && (
          <rect x={PADDING + lastLineWidth + 4} y={lastRowY - size * 0.85} width={Math.max(size * 0.08, 2)} height={size} fill={cursorColor} opacity={0}>
            <set attributeName="opacity" to="1" begin={`${totalTyping}s`} fill="freeze" />
            <animate
              attributeName="opacity"
              begin={`${totalTyping}s`}
              dur="1s"
              values="1;1;0;0;1"
              keyTimes="0;0.49;0.5;0.99;1"
              repeatCount="indefinite"
            />
          </rect>
        )}
      </>
    );
  } else {
    // Rotate mode: one line visible at a time, typed then erased, looping forever.
    // All lines and the cursor share ONE synchronized clock (dur=totalCycle,
    // begin=0, repeatCount=indefinite) with each line's own reveal encoded as
    // keyTimes/values fractions of that shared cycle — this keeps every
    // animated element perfectly in lockstep without SMIL syncbase chaining.
    const eraseSec = typeSec / 2;
    const segmentDur = typeSec + pauseSec + eraseSec;
    const totalCycle = segmentDur * shownLines.length;
    const rowY = cardHeight / 2 + size * 0.35;

    const cursorPoints: Point[] = [];

    content = (
      <>
        <defs>
          {shownLines.map((line, i) => {
            const t0 = i * segmentDur;
            const t1 = t0 + typeSec;
            const t2 = t1 + pauseSec;
            const t3 = t2 + eraseSec;
            const w = lineWidths[i] + 4;

            cursorPoints.push([t0, 0], [t1, w], [t2, w], [t3, 0]);

            const { keyTimes, values } = buildKeyframes(
              [
                [0, 0],
                [t0, 0],
                [t1, w],
                [t2, w],
                [t3, 0],
                [totalCycle, 0],
              ],
              totalCycle
            );

            return (
              <clipPath id={`typing-line-${i}`} key={i}>
                <rect x={PADDING} y={rowY - size} width={0} height={size * 1.4}>
                  <animate
                    attributeName="width"
                    dur={`${totalCycle}s`}
                    begin="0s"
                    repeatCount="indefinite"
                    keyTimes={keyTimes}
                    values={values}
                  />
                </rect>
              </clipPath>
            );
          })}
        </defs>
        {shownLines.map((line, i) => (
          <g key={i} clipPath={`url(#typing-line-${i})`}>
            <text x={PADDING} y={rowY} fill={textColor} fontFamily={font} fontSize={size}>
              {line}
            </text>
          </g>
        ))}
        {!hideCursor &&
          (() => {
            const offsetPoints: Point[] = [[0, PADDING], ...cursorPoints.map(([t, v]): Point => [t, PADDING + v]), [totalCycle, PADDING]];
            const { keyTimes, values } = buildKeyframes(offsetPoints, totalCycle);
            return (
              <rect x={PADDING} y={rowY - size * 0.85} width={Math.max(size * 0.08, 2)} height={size} fill={cursorColor}>
                <animate attributeName="x" dur={`${totalCycle}s`} begin="0s" repeatCount="indefinite" keyTimes={keyTimes} values={values} />
                <animate
                  attributeName="opacity"
                  dur="1s"
                  begin="0s"
                  repeatCount="indefinite"
                  values="1;1;0;0;1"
                  keyTimes="0;0.49;0.5;0.99;1"
                />
              </rect>
            );
          })()}
      </>
    );
  }

  return (
    <Card
      width={width}
      height={Math.round(cardHeight)}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="typing-header"
    >
      {content}
    </Card>
  );
}
