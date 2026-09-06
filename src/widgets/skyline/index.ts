import { fetchContributionData, type FullContributionData } from "@/lib/github";
import { buildHeatmapGrid } from "@/lib/heatmap";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { SkylineCard } from "./SkylineCard";
import { getMockSkylineData } from "./mock";
import { SKYLINE_SCHEMA, type SkylineOptions } from "./schema";

// `weeks` only affects derivation (how much of the same full history to
// slice into the grid), same as the heatmap widget — stays out of
// fetchRawData's cache key.
async function fetchSkylineRawData(options: SkylineOptions): Promise<FullContributionData> {
  return fetchContributionData(options.username);
}

function computeSkylineData(raw: FullContributionData): FullContributionData {
  return raw;
}

function renderSkylineSvg(data: FullContributionData, options: SkylineOptions): string {
  return renderJsxToSvg(
    SkylineCard({
      contributionDays: data.contributionDays,
      weeks: options.weeks,
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

function skylineToJson(data: FullContributionData, options: SkylineOptions) {
  return buildHeatmapGrid(data.contributionDays, options.weeks, options.locale);
}

registerWidget({
  type: "skyline",
  schema: SKYLINE_SCHEMA,
  cacheSecondsDefault: 3600,
  fetchRawData: fetchSkylineRawData,
  computeData: computeSkylineData,
  renderSvg: renderSkylineSvg,
  toJson: skylineToJson,
  mockRawData: () => getMockSkylineData(),
});

export type { SkylineOptions } from "./schema";
