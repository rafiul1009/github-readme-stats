"use client";

import { getWidgetCatalogEntry } from "@/widgets/catalog";
import type { ProfileConfig } from "./types";
import { socialBadgeUrl, socialLinkUrl, techBadgeUrl } from "./badges";
import { widgetPreviewUrl } from "./widgetUrl";

export interface ReadmePreviewProps {
  config: ProfileConfig;
}

/** Approximates how the exported README renders on GitHub, using mock widget data (task 4.6). */
export function ReadmePreview({ config }: ReadmePreviewProps) {
  const alignClass = config.align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col gap-4 ${alignClass}`}>
      {config.name.trim() && <h2 className="text-xl font-bold">{`Hi, I'm ${config.name.trim()}`}</h2>}
      {config.bio.trim() && <p className="text-sm opacity-80">{config.bio.trim()}</p>}

      {config.socials.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {config.socials.map((link) => {
            const badge = socialBadgeUrl(link);
            const href = socialLinkUrl(link);
            if (!badge || !href) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={link.id} src={badge} alt={link.platform} className="h-6" />
            );
          })}
        </div>
      )}

      {config.techStack.length > 0 && (
        <div className="w-full">
          <p className="text-xs font-semibold uppercase opacity-60 mb-1">Tech Stack</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {config.techStack.map((slug) => {
              const badge = techBadgeUrl(slug);
              if (!badge) return null;
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={slug} src={badge} alt={slug} className="h-6" />
              );
            })}
          </div>
        </div>
      )}

      {config.widgets.length > 0 && (
        <div className={`w-full flex flex-wrap gap-3 ${config.layout === "stacked" ? "flex-col" : "flex-row justify-center"}`}>
          {config.widgets.map((instance) => {
            const entry = getWidgetCatalogEntry(instance.type);
            if (!entry) return null;
            const src = widgetPreviewUrl(instance, config.theme);
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={instance.id} src={src} alt={entry.label} className="max-w-full border rounded" />
            );
          })}
        </div>
      )}

      {config.widgets.length === 0 && !config.name.trim() && !config.bio.trim() && (
        <p className="text-sm opacity-50">Fill in the form to see your README preview here.</p>
      )}
    </div>
  );
}
