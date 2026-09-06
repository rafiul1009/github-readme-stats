import Link from "next/link";
import { WIDGET_CATALOG } from "@/widgets/catalog";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">GitHub Readme Stats</h1>
        <p className="text-base text-neutral-500 max-w-md mx-auto">
          A customizable widget generator for GitHub profile READMEs.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/build"
          className="rounded-full bg-blue-600 text-white px-5 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Open the widget builder
        </Link>
        <Link
          href="/profile"
          className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
        >
          Build a full README
        </Link>
        <Link
          href="/gallery"
          className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
        >
          Browse the gallery
        </Link>
        <Link
          href="/themes"
          className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
        >
          Browse themes
        </Link>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {WIDGET_CATALOG.map((w) => (
          <Link
            key={w.type}
            href={`/build?_widget=${w.type}`}
            className="text-sm px-3 py-1.5 rounded-full border hover:bg-black/5 dark:hover:bg-white/10"
          >
            {w.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
