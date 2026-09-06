import { escapeXml } from "@/lib/escape";
import { getWidgetCatalogEntry } from "@/widgets/catalog";
import type { ProfileConfig } from "./types";
import { socialBadgeUrl, socialLinkUrl, techBadgeUrl } from "./badges";
import { effectiveIdentifyingValue, widgetImageUrl } from "./widgetUrl";

/** Assembles a complete README.md from a profile config (task 4.6). */
export function buildReadmeMarkdown(config: ProfileConfig, origin: string): string {
  const sections: string[] = [];

  if (config.name.trim()) sections.push(`# Hi, I'm ${config.name.trim()}`);
  if (config.bio.trim()) sections.push(config.bio.trim());

  const socialCells = config.socials
    .map((link) => {
      const badge = socialBadgeUrl(link);
      const href = socialLinkUrl(link);
      if (!badge || !href) return undefined;
      return `<a href="${href}"><img src="${badge}" alt="${escapeXml(link.platform)}" /></a>`;
    })
    .filter((x): x is string => Boolean(x));
  if (socialCells.length > 0) {
    sections.push(`<p align="${config.align}">\n  ${socialCells.join("\n  ")}\n</p>`);
  }

  const techCells = config.techStack
    .map((slug) => {
      const badge = techBadgeUrl(slug);
      if (!badge) return undefined;
      return `<img src="${badge}" alt="${escapeXml(slug)}" />`;
    })
    .filter((x): x is string => Boolean(x));
  if (techCells.length > 0) {
    sections.push(`### Tech Stack\n\n<p align="${config.align}">\n  ${techCells.join("\n  ")}\n</p>`);
  }

  const widgetImages = config.widgets
    .map((instance) => {
      const entry = getWidgetCatalogEntry(instance.type);
      const url = widgetImageUrl(origin, instance, config.theme, config.username);
      if (!entry || !url) return undefined;
      const identifyingValue = effectiveIdentifyingValue(instance, config.username);
      const alt = escapeXml(`${identifyingValue} — ${entry.label}`);
      return `<img src="${url}" alt="${alt}" />`;
    })
    .filter((x): x is string => Boolean(x));

  if (widgetImages.length > 0) {
    if (config.layout === "side-by-side") {
      sections.push(`<p align="${config.align}">\n  ${widgetImages.join("\n  ")}\n</p>`);
    } else {
      sections.push(widgetImages.map((img) => `<p align="${config.align}">\n  ${img}\n</p>`).join("\n\n"));
    }
  }

  return sections.join("\n\n") + "\n";
}
