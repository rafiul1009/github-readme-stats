import type { SocialLink } from "./types";
import { getSocialPlatform } from "./social";
import { getTech } from "./techstack";

const SHIELDS_BASE = "https://img.shields.io/badge";

export function socialBadgeUrl(link: SocialLink): string | undefined {
  const platform = getSocialPlatform(link.platform);
  if (!platform || !link.value.trim()) return undefined;
  const label = encodeURIComponent(platform.label);
  return `${SHIELDS_BASE}/${label}-${platform.color}?style=for-the-badge&logo=${platform.logo}&logoColor=white`;
}

export function socialLinkUrl(link: SocialLink): string | undefined {
  const platform = getSocialPlatform(link.platform);
  if (!platform || !link.value.trim()) return undefined;
  return platform.buildUrl(link.value.trim());
}

export function techBadgeUrl(slug: string): string | undefined {
  const tech = getTech(slug);
  if (!tech) return undefined;
  const label = encodeURIComponent(tech.label);
  return `${SHIELDS_BASE}/${label}-${tech.color}?style=for-the-badge&logo=${tech.logo ?? tech.slug}&logoColor=white`;
}
