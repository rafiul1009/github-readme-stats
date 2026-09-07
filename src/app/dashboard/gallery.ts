/**
 * The style-taxonomy showcase, lifted out of the deleted `/gallery` page and
 * reduced to data (docs/TODOS.md 12.16). Every example renders from bundled
 * mock data via `/preview` — no username, no GitHub API call — and loads into
 * the dashboard on click rather than navigating anywhere.
 */
export interface GalleryExample {
  widgetType: string;
  label: string;
  params: Record<string, string>;
}

export interface GallerySection {
  title: string;
  description: string;
  examples: GalleryExample[];
}

export const GALLERY_SECTIONS: GallerySection[] = [
  {
    title: "Minimal",
    description: "Clean, low-contrast cards for a subdued README.",
    examples: [
      { widgetType: "stats", label: "Stats — borderless", params: { theme: "default", hide_border: "true" } },
      { widgetType: "streak", label: "Streak — transparent", params: { theme: "transparent" } },
      { widgetType: "top-langs", label: "Top Languages — compact", params: { theme: "default", layout: "compact" } },
    ],
  },
  {
    title: "Vivid",
    description: "High-saturation themes that pop on a dark profile.",
    examples: [
      { widgetType: "top-langs", label: "Top Languages — donut", params: { theme: "synthwave", layout: "donut" } },
      { widgetType: "activity-graph", label: "Activity Graph — area", params: { theme: "radical", graph_style: "area" } },
      { widgetType: "stats", label: "Stats — dracula", params: { theme: "dracula", show_icons: "true" } },
    ],
  },
  {
    title: "Retro",
    description: "Warm, terminal-inspired palettes.",
    examples: [
      { widgetType: "trophy", label: "Trophies — gruvbox", params: { theme: "gruvbox" } },
      { widgetType: "heatmap", label: "Heatmap — monokai", params: { theme: "monokai" } },
      { widgetType: "wakatime", label: "WakaTime — tokyonight", params: { theme: "tokyonight" } },
    ],
  },
  {
    title: "Animated",
    description: "Cards with motion — typing text, drawing lines, staggered reveals.",
    examples: [
      {
        widgetType: "typing-header",
        label: "Typing Header — rotating lines",
        params: { theme: "default", lines: "Hi, I'm a developer.,I build for the web.,Welcome to my profile!" },
      },
      { widgetType: "activity-graph", label: "Activity Graph — draw-on line", params: { theme: "nord", graph_style: "line" } },
      { widgetType: "badges", label: "Badges — wave", params: { theme: "onedark", name: "followers,total-stars", wave: "true" } },
    ],
  },
  {
    title: "Badges",
    description: "Composable label:value pill rows for quick stats.",
    examples: [
      { widgetType: "badges", label: "User badges", params: { theme: "default", name: "repositories,followers,total-stars,total-commits" } },
      { widgetType: "badges", label: "Themed cycling", params: { theme: "default", name: "followers,total-stars,total-commits", themes: "dark,radical,dracula" } },
      { widgetType: "badges", label: "Glow", params: { theme: "cobalt2", name: "total-issues,total-pull-requests", glow: "true" } },
    ],
  },
  {
    title: "Icons",
    description: "A bundled tech-icon library — no shields.io round trip.",
    examples: [
      { widgetType: "tech-icons", label: "Tech stack grid", params: { theme: "default", name: "react,typescript,nodedotjs,python,docker,postgresql" } },
      { widgetType: "tech-icons", label: "Brand colours + glow", params: { theme: "default", name: "github,figma,vercel", glow: "true" } },
      { widgetType: "tech-icons", label: "Custom colours", params: { theme: "default", name: "react,vuedotjs,svelte", color: "ffffff,ffffff,ffffff" } },
    ],
  },
  {
    title: "3D",
    description: "An isometric skyline, rendered as pure SVG — no build pipeline.",
    examples: [
      { widgetType: "skyline", label: "Skyline — default", params: { theme: "default" } },
      { widgetType: "skyline", label: "Skyline — radical", params: { theme: "radical", weeks: "40" } },
      { widgetType: "skyline", label: "Skyline — tokyonight", params: { theme: "tokyonight", weeks: "16" } },
    ],
  },
  {
    title: "Beyond GitHub",
    description: "A blog feed, a Q&A profile, a package's downloads, a repo's roster.",
    examples: [
      { widgetType: "medium", label: "Medium — latest articles", params: { theme: "default", username: "medium" } },
      { widgetType: "stackoverflow", label: "Stack Overflow reputation", params: { theme: "default", user_id: "1" } },
      { widgetType: "npm-downloads", label: "npm weekly downloads", params: { theme: "default", package: "react" } },
    ],
  },
];
