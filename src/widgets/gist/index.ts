import { fetchGistData, type RawGistData } from "@/lib/githubRepo";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { GistCard } from "./GistCard";
import { getMockGistData } from "./mock";
import { GIST_SCHEMA, type GistOptions } from "./schema";

async function fetchGistRawData(options: GistOptions): Promise<RawGistData> {
  return fetchGistData(options.id);
}

function computeGistData(raw: RawGistData): RawGistData {
  return raw;
}

function renderGistSvg(data: RawGistData, options: GistOptions): string {
  return renderJsxToSvg(
    GistCard({
      gist: data,
      showOwner: options.show_owner,
      theme: getTheme(options.theme),
      overrides: {
        background: options.bg_color,
        border: options.border_color,
        icon: options.icon_color,
        title: options.title_color,
        text: options.text_color,
      },
      locale: options.locale,
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
      width: options.card_width,
    })
  );
}

function gistToJson(data: RawGistData): unknown {
  return data;
}

registerWidget({
  type: "gist",
  schema: GIST_SCHEMA,
  cacheSecondsDefault: 3600,
  requiresUsername: false,
  dataCacheKeyBase: (options) => options.id,
  fetchRawData: fetchGistRawData,
  computeData: computeGistData,
  renderSvg: renderGistSvg,
  toJson: gistToJson,
  mockRawData: () => getMockGistData(),
});

export type { GistOptions } from "./schema";
