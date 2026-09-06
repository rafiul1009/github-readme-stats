import { fetchRepoData, type RawRepoData } from "@/lib/githubRepo";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { PinCard } from "./PinCard";
import { getMockRepoData } from "./mock";
import { PIN_SCHEMA, type PinOptions } from "./schema";

async function fetchPinRawData(options: PinOptions): Promise<RawRepoData> {
  return fetchRepoData(options.repo);
}

function computePinData(raw: RawRepoData): RawRepoData {
  return raw;
}

function renderPinSvg(data: RawRepoData, options: PinOptions): string {
  return renderJsxToSvg(
    PinCard({
      repo: data,
      showOwner: options.show_owner,
      descriptionLinesCount: options.description_lines_count || undefined,
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

function pinToJson(data: RawRepoData): unknown {
  return data;
}

registerWidget({
  type: "pin",
  schema: PIN_SCHEMA,
  cacheSecondsDefault: 3600,
  requiresUsername: false,
  dataCacheKeyBase: (options) => options.repo,
  fetchRawData: fetchPinRawData,
  computeData: computePinData,
  renderSvg: renderPinSvg,
  toJson: pinToJson,
  mockRawData: () => getMockRepoData(),
});

export type { PinOptions } from "./schema";
