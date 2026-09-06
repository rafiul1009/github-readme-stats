import Link from "next/link";
import { listThemes } from "@/lib/themes";

/**
 * Theme catalog docs page (docs/TODOS.md 10.4): every registered preset,
 * rendered from bundled mock data via `/preview` (no username, no GitHub
 * API call), linking into the builder pre-seeded with that theme selected.
 */
export default function ThemesPage() {
  const themes = listThemes();

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Themes</h1>
      <p className="text-sm opacity-70 mb-8">
        {themes.length} verified presets — click any to open it, pre-selected, in the{" "}
        <Link href="/build" className="underline">
          builder
        </Link>
        .
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <Link
            key={theme.name}
            href={`/build?_widget=stats&theme=${theme.name}`}
            className="block border rounded-lg p-3 hover:border-blue-500 transition-colors bg-black/[.015] dark:bg-white/[.02]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external, dynamically-generated SVG */}
            <img
              src={`/api/widget/stats/preview?theme=${theme.name}&show_icons=true`}
              alt={theme.label}
              className="max-w-full mb-2 rounded"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium opacity-80">{theme.label}</span>
              <span className="text-[10px] opacity-50">{theme.mode}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
