import { getIcon } from "@/lib/icons";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { TechIconsCard, type ResolvedIcon } from "./TechIconsCard";
import { getMockTechIconsData } from "./mock";
import { TECH_ICONS_SCHEMA, type TechIconsOptions } from "./schema";

async function fetchTechIconsRawData(): Promise<Record<string, never>> {
  return {};
}

function computeTechIconsData(_raw: Record<string, never>, options: TechIconsOptions): ResolvedIcon[] {
  return options.name.map((slug, i) => {
    const rawColor = options.color[i];
    const color = rawColor ? (rawColor.startsWith("#") ? rawColor : `#${rawColor}`) : undefined;
    return { icon: getIcon(slug) ?? null, requestedSlug: slug, color };
  });
}

function renderTechIconsSvg(data: ResolvedIcon[], options: TechIconsOptions): string {
  return renderJsxToSvg(
    TechIconsCard({
      icons: data,
      columns: options.columns,
      size: options.size,
      glow: options.glow,
      wave: options.wave,
      customTitle: options.custom_title,
      theme: getTheme(options.theme),
      overrides: {
        background: options.bg_color,
        border: options.border_color,
        title: options.title_color,
        text: options.text_color,
      },
      locale: options.locale,
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      hideTitle: options.hide_title,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
    })
  );
}

function techIconsToJson(data: ResolvedIcon[]): unknown {
  return data.map((d) => ({ slug: d.requestedSlug, found: d.icon !== null, color: d.color ?? d.icon?.hex }));
}

registerWidget({
  type: "tech-icons",
  schema: TECH_ICONS_SCHEMA,
  cacheSecondsDefault: 86400,
  requiresUsername: false,
  requiresGithubToken: false,
  dataCacheKeyBase: () => "static",
  fetchRawData: fetchTechIconsRawData,
  computeData: computeTechIconsData,
  renderSvg: renderTechIconsSvg,
  toJson: techIconsToJson,
  mockRawData: () => getMockTechIconsData(),
});

export type { TechIconsOptions } from "./schema";
