import { WidgetRenderError } from "@/widgets/errors";

/**
 * Medium's public per-profile/per-publication RSS feed (docs/TODOS.md
 * 11.3) — no auth, no API key, just `https://medium.com/feed/@<username>`
 * (or `/feed/<publication-slug>` for a publication). This is a
 * Medium-feed-specific extractor, not a general RSS/Atom parser: it's
 * regex-based against Medium's own consistently-shaped `<item>` blocks
 * (verified against a live fetch while building this), which is
 * appropriate for one known, stable feed format but would NOT be safe to
 * point at an arbitrary user-supplied feed URL — hence no `feed_url`
 * option, only `username`/`publication`.
 */

export interface MediumPost {
  title: string;
  link: string;
  pubDate: string;
}

function decodeEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTag(itemXml: string, tag: string): string | null {
  const cdataMatch = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`).exec(itemXml);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(itemXml);
  return plainMatch ? decodeEntities(plainMatch[1].trim()) : null;
}

function parseMediumRss(xml: string): MediumPost[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const posts: MediumPost[] = [];

  for (const itemXml of items) {
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    if (!title || !link) continue;
    posts.push({ title, link, pubDate: pubDate ?? "" });
  }

  return posts;
}

function feedUrlFor(username: string | undefined, publication: string | undefined): string {
  if (publication) return `https://medium.com/feed/${encodeURIComponent(publication)}`;
  if (username) return `https://medium.com/feed/@${encodeURIComponent(username)}`;
  throw new WidgetRenderError("Either username or publication is required", 400);
}

export async function fetchMediumPosts(username: string | undefined, publication: string | undefined): Promise<MediumPost[]> {
  const url = feedUrlFor(username, publication);

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new WidgetRenderError(`Failed to fetch Medium feed: ${message}`, 502);
  }

  if (response.status === 404) {
    throw new WidgetRenderError(`Medium feed not found for "${username ?? publication}"`, 404);
  }
  if (!response.ok) {
    throw new WidgetRenderError(`Failed to fetch Medium feed: Medium returned ${response.status}`, 502);
  }

  const xml = await response.text();
  return parseMediumRss(xml);
}
