import Link from "next/link";

interface GalleryExample {
  widgetType: string;
  label: string;
  theme: string;
  params?: Record<string, string>;
}

interface GallerySection {
  title: string;
  description: string;
  examples: GalleryExample[];
}

function buildQuery(theme: string, params?: Record<string, string>): string {
  const search = new URLSearchParams({ theme, ...params });
  return search.toString();
}

/**
 * Style-taxonomy showcase (docs/TODOS.md 9.4): every example renders from
 * bundled mock data via `/preview` (no username, no GitHub API call — same
 * zero-cost preview mechanism the builder itself uses) and links into the
 * builder pre-seeded with that example's widget type + options, reusing the
 * URL-state seeding `/build` already supports (task 1.14).
 */
const SECTIONS: GallerySection[] = [
  {
    title: "Minimal",
    description: "Clean, low-contrast cards for a subdued README.",
    examples: [
      { widgetType: "stats", label: "Stats — default", theme: "default", params: { hide_border: "true" } },
      { widgetType: "streak", label: "Streak — transparent", theme: "transparent" },
      { widgetType: "top-langs", label: "Top Languages — compact", theme: "default", params: { layout: "compact" } },
    ],
  },
  {
    title: "Vivid",
    description: "High-saturation themes that pop on a dark profile.",
    examples: [
      { widgetType: "top-langs", label: "Top Languages — donut", theme: "synthwave", params: { layout: "donut" } },
      { widgetType: "activity-graph", label: "Activity Graph — area", theme: "radical", params: { graph_style: "area" } },
      { widgetType: "stats", label: "Stats — dracula", theme: "dracula", params: { show_icons: "true" } },
    ],
  },
  {
    title: "Retro",
    description: "Warm, terminal-inspired palettes.",
    examples: [
      { widgetType: "trophy", label: "Trophies — gruvbox", theme: "gruvbox" },
      { widgetType: "heatmap", label: "Heatmap — monokai", theme: "monokai" },
      { widgetType: "wakatime", label: "WakaTime — tokyonight", theme: "tokyonight" },
    ],
  },
  {
    title: "Animated",
    description: "Cards with motion — typing text, drawing lines, staggered reveals.",
    examples: [
      {
        widgetType: "typing-header",
        label: "Typing Header — rotating lines",
        theme: "default",
        params: { lines: "Hi, I'm a developer.,I build for the web.,Welcome to my profile!" },
      },
      { widgetType: "activity-graph", label: "Activity Graph — line (draw-on)", theme: "nord", params: { graph_style: "line" } },
      { widgetType: "badges", label: "Badges — wave", theme: "onedark", params: { name: "followers,total-stars", wave: "true" } },
    ],
  },
  {
    title: "Badges",
    description: "Composable label:value pill rows for quick stats.",
    examples: [
      { widgetType: "badges", label: "User badges", theme: "default", params: { name: "repositories,followers,total-stars,total-commits" } },
      { widgetType: "badges", label: "Themed cycling", theme: "default", params: { name: "followers,total-stars,total-commits", themes: "dark,radical,dracula" } },
      { widgetType: "badges", label: "Glow", theme: "cobalt2", params: { name: "total-issues,total-pull-requests", glow: "true" } },
    ],
  },
  {
    title: "Icons",
    description: "A bundled tech-icon library — no shields.io round trip.",
    examples: [
      { widgetType: "tech-icons", label: "Tech stack grid", theme: "default", params: { name: "react,typescript,nodedotjs,python,docker,postgresql" } },
      { widgetType: "tech-icons", label: "Brand colors + glow", theme: "default", params: { name: "github,figma,vercel", glow: "true" } },
      { widgetType: "tech-icons", label: "Custom colors", theme: "default", params: { name: "react,vuedotjs,svelte", color: "ffffff,ffffff,ffffff" } },
    ],
  },
  {
    title: "3D",
    description: "An isometric-projected skyline, rendered as pure SVG — no build pipeline required.",
    examples: [
      { widgetType: "skyline", label: "Skyline — default", theme: "default" },
      { widgetType: "skyline", label: "Skyline — radical", theme: "radical", params: { weeks: "40" } },
      { widgetType: "skyline", label: "Skyline — tokyonight", theme: "tokyonight", params: { weeks: "16" } },
    ],
  },
  {
    title: "Ecosystem",
    description: "Beyond GitHub — a blog feed, a Q&A profile, a package's download count, a repo's roster.",
    examples: [
      { widgetType: "medium", label: "Medium — latest articles", theme: "default", params: { username: "medium" } },
      { widgetType: "stackoverflow", label: "Stack Overflow reputation", theme: "default", params: { user_id: "1" } },
      { widgetType: "npm-downloads", label: "npm weekly downloads", theme: "default", params: { package: "react" } },
    ],
  },
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Gallery</h1>
      <p className="text-sm opacity-70 mb-8">
        A taxonomy of styles this project can produce — click any example to open it, pre-configured, in the{" "}
        <Link href="/build" className="underline">
          builder
        </Link>
        .
      </p>

      <div className="flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold mb-1">{section.title}</h2>
            <p className="text-xs opacity-60 mb-3">{section.description}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.examples.map((example, i) => {
                const query = buildQuery(example.theme, example.params);
                return (
                  <Link
                    key={i}
                    href={`/build?_widget=${example.widgetType}&${query}`}
                    className="block border rounded-lg p-3 hover:border-blue-500 transition-colors bg-black/[.015] dark:bg-white/[.02]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- external, dynamically-generated SVG */}
                    <img
                      src={`/api/widget/${example.widgetType}/preview?${query}`}
                      alt={example.label}
                      className="max-w-full mb-2 rounded"
                    />
                    <span className="text-xs font-medium opacity-80">{example.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
