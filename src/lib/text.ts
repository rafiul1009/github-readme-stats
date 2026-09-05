/**
 * Word-wraps `text` into at most `maxLines` lines of roughly
 * `maxCharsPerLine` characters, ellipsizing the last line if content was
 * cut off. Used for repo/gist descriptions, which arrive as a single
 * unbounded string with no natural line breaks to render against a fixed
 * card width.
 */
export function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  let wordIndex = 0;

  while (wordIndex < words.length && lines.length < maxLines) {
    const word = words[wordIndex];
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxCharsPerLine || !current) {
      current = candidate;
      wordIndex += 1;
    } else {
      lines.push(current);
      current = "";
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  const truncated = wordIndex < words.length;
  if (truncated && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last.length > maxCharsPerLine - 1 && last.length > 0) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last.trimEnd()}…`;
  }

  return lines;
}
