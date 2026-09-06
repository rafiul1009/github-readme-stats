export interface SocialPlatformDef {
  key: string;
  label: string;
  /** shields.io badge logo slug (simple-icons name). */
  logo: string;
  /** Badge background color, as a 6-digit hex without '#'. */
  color: string;
  placeholder: string;
  /** Builds the profile URL for a given handle/value. */
  buildUrl: (value: string) => string;
}

function urlOrPrefixed(prefix: string) {
  return (value: string) => (value.startsWith("http") ? value : `${prefix}${value}`);
}

/**
 * Curated social platforms for the identity section (task 4.4). Each renders
 * as a shields.io badge until the native badge engine (Phase 8) replaces it.
 */
export const SOCIAL_PLATFORMS: SocialPlatformDef[] = [
  {
    key: "github",
    label: "GitHub",
    logo: "github",
    color: "181717",
    placeholder: "octocat",
    buildUrl: urlOrPrefixed("https://github.com/"),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    logo: "linkedin",
    color: "0A66C2",
    placeholder: "in/octocat",
    buildUrl: urlOrPrefixed("https://linkedin.com/"),
  },
  {
    key: "x",
    label: "X / Twitter",
    logo: "x",
    color: "000000",
    placeholder: "octocat",
    buildUrl: urlOrPrefixed("https://x.com/"),
  },
  {
    key: "instagram",
    label: "Instagram",
    logo: "instagram",
    color: "E4405F",
    placeholder: "octocat",
    buildUrl: urlOrPrefixed("https://instagram.com/"),
  },
  {
    key: "youtube",
    label: "YouTube",
    logo: "youtube",
    color: "FF0000",
    placeholder: "@octocat",
    buildUrl: urlOrPrefixed("https://youtube.com/"),
  },
  {
    key: "twitch",
    label: "Twitch",
    logo: "twitch",
    color: "9146FF",
    placeholder: "octocat",
    buildUrl: urlOrPrefixed("https://twitch.tv/"),
  },
  {
    key: "devto",
    label: "Dev.to",
    logo: "devdotto",
    color: "0A0A0A",
    placeholder: "octocat",
    buildUrl: urlOrPrefixed("https://dev.to/"),
  },
  {
    key: "medium",
    label: "Medium",
    logo: "medium",
    color: "12100E",
    placeholder: "@octocat",
    buildUrl: urlOrPrefixed("https://medium.com/"),
  },
  {
    key: "stackoverflow",
    label: "Stack Overflow",
    logo: "stackoverflow",
    color: "F58025",
    placeholder: "users/123456/octocat",
    buildUrl: urlOrPrefixed("https://stackoverflow.com/"),
  },
  {
    key: "discord",
    label: "Discord",
    logo: "discord",
    color: "5865F2",
    placeholder: "invite code",
    buildUrl: urlOrPrefixed("https://discord.gg/"),
  },
  {
    key: "telegram",
    label: "Telegram",
    logo: "telegram",
    color: "26A5E4",
    placeholder: "octocat",
    buildUrl: urlOrPrefixed("https://t.me/"),
  },
  {
    key: "website",
    label: "Website",
    logo: "googlechrome",
    color: "4285F4",
    placeholder: "https://example.com",
    buildUrl: (v) => v,
  },
  {
    key: "email",
    label: "Email",
    logo: "gmail",
    color: "D14836",
    placeholder: "you@example.com",
    buildUrl: (v) => `mailto:${v}`,
  },
];

export function getSocialPlatform(key: string): SocialPlatformDef | undefined {
  return SOCIAL_PLATFORMS.find((p) => p.key === key);
}
