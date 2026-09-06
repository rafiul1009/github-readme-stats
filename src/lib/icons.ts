import * as simpleIconsModule from "simple-icons";

export interface IconData {
  title: string;
  slug: string;
  /** Brand color, no leading '#'. */
  hex: string;
  /** SVG path data on a 24x24 viewBox. */
  path: string;
}

/**
 * Bundled tech-icon library (docs/TODOS.md 8.5/8.6): simple-icons ships
 * ~3,459 brand icons as path data + hex colors, CC0-licensed, so this
 * project doesn't need to draw or license icon glyphs itself. Its package
 * exports one named export per icon (`siReact`, `siDotnet`, ...) rather
 * than a slug-keyed map, so this builds that lookup once at module load by
 * scanning every export for its own `.slug` field — robust to the exact
 * export-naming convention simple-icons uses internally, which has changed
 * across major versions.
 */
const ICONS_BY_SLUG = new Map<string, IconData>();

for (const value of Object.values(simpleIconsModule)) {
  if (
    value &&
    typeof value === "object" &&
    "slug" in value &&
    "path" in value &&
    "hex" in value &&
    "title" in value
  ) {
    const icon = value as IconData;
    ICONS_BY_SLUG.set(icon.slug.toLowerCase(), icon);
  }
}

export function getIcon(slug: string): IconData | undefined {
  return ICONS_BY_SLUG.get(slug.trim().toLowerCase());
}

export function listIconSlugs(): string[] {
  return Array.from(ICONS_BY_SLUG.keys());
}
