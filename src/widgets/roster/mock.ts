export interface RawRosterCardData {
  totalCount: number;
  avatars: { login: string; dataUri: string }[];
}

/** A tiny transparent 1x1 PNG — enough to preview the grid layout without a real network fetch. */
const PLACEHOLDER_AVATAR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

export function getMockRosterData(): RawRosterCardData {
  const avatars = Array.from({ length: 18 }, (_, i) => ({
    login: `octocat${i + 1}`,
    dataUri: PLACEHOLDER_AVATAR,
  }));
  return { totalCount: 342, avatars };
}
