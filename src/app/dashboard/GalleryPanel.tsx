"use client";

import { GALLERY_SECTIONS } from "./gallery";
import { useDashboard } from "./context";

/**
 * The former `/gallery` page as a sidebar tab (docs/TODOS.md 12.16). Clicking
 * an example loads its widget type and params into the dashboard instead of
 * navigating. Previews are lazy-loaded, and the panel only mounts while its
 * tab is active, so the ~24 sample renders are not paid for on every load.
 */
export function GalleryPanel() {
  const { dispatch } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      {GALLERY_SECTIONS.map((section) => (
        <section key={section.title}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-0.5">
            {section.title}
          </h3>
          <p className="text-[11px] text-muted-foreground mb-2">{section.description}</p>
          <div className="flex flex-col gap-2">
            {section.examples.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  dispatch({ type: "loadExample", widgetType: example.widgetType, params: example.params })
                }
                className="group rounded-lg border p-2 text-left transition-colors hover:border-brand/50 hover:bg-accent/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- dynamically generated SVG; next/image does not apply */}
                <img
                  src={`/api/widget/${example.widgetType}/preview?${new URLSearchParams(example.params).toString()}`}
                  alt={example.label}
                  loading="lazy"
                  className="w-full rounded mb-1.5 bg-background"
                />
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                  {example.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
