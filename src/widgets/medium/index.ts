import { fetchMediumPosts, type MediumPost } from "@/lib/medium";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { MediumCard } from "./MediumCard";
import { getMockMediumPosts } from "./mock";
import { MEDIUM_SCHEMA, type MediumOptions } from "./schema";

async function fetchMediumRawData(options: MediumOptions): Promise<MediumPost[]> {
  const username = options.username as string | undefined;
  const publication = options.publication as string | undefined;
  return fetchMediumPosts(username, publication);
}

function computeMediumData(raw: MediumPost[], options: MediumOptions): MediumPost[] {
  return raw.slice(0, options.limit);
}

function renderMediumSvg(data: MediumPost[], options: MediumOptions): string {
  return renderJsxToSvg(
    MediumCard({
      posts: data,
      customTitle: options.custom_title,
      theme: getTheme(options.theme),
      overrides: {
        background: options.bg_color,
        border: options.border_color,
        title: options.title_color,
        text: options.text_color,
        accent: options.icon_color,
      },
      locale: options.locale,
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      hideTitle: options.hide_title,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
      width: options.card_width,
    })
  );
}

function mediumToJson(data: MediumPost[]): unknown {
  return data;
}

registerWidget({
  type: "medium",
  schema: MEDIUM_SCHEMA,
  cacheSecondsDefault: 3600,
  requiresUsername: false,
  requiresGithubToken: false,
  dataCacheKeyBase: (options) => (options.username as string | undefined) || (options.publication as string | undefined),
  fetchRawData: fetchMediumRawData,
  computeData: computeMediumData,
  renderSvg: renderMediumSvg,
  toJson: mediumToJson,
  mockRawData: () => getMockMediumPosts(),
});

export type { MediumOptions } from "./schema";
