import type { FormState } from "@/app/build/query";

/** One configured widget in a profile (task 4.1). */
export interface WidgetInstance {
  id: string;
  type: string;
  /** Value for the widget's identifying field (username/repo/gist id). */
  identifyingValue: string;
  /** Every option except `theme` — theme is locked at the profile level (task 4.3). */
  options: FormState;
}

export interface SocialLink {
  id: string;
  /** Key into SOCIAL_PLATFORMS. */
  platform: string;
  /** Username, handle, or full URL depending on the platform. */
  value: string;
}

/** Side-by-side rows wrap widgets together; stacked gives each its own line (task 4.2). */
export type ProfileLayout = "stacked" | "side-by-side";
export type ProfileAlign = "left" | "center";

export interface ProfileConfig {
  username: string;
  name: string;
  bio: string;
  socials: SocialLink[];
  /** Keys into TECH_STACK. */
  techStack: string[];
  widgets: WidgetInstance[];
  theme: string;
  layout: ProfileLayout;
  align: ProfileAlign;
}

export function emptyProfileConfig(): ProfileConfig {
  return {
    username: "",
    name: "",
    bio: "",
    socials: [],
    techStack: [],
    widgets: [],
    theme: "default",
    layout: "stacked",
    align: "center",
  };
}

export function newWidgetInstance(type: string, identifyingValue: string): WidgetInstance {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    identifyingValue,
    options: {},
  };
}
