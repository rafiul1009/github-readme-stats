import { fetchContributionData, type FullContributionData } from "@/lib/github";
import { buildHeatmapGrid, type HeatmapGrid } from "@/lib/heatmap";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { HeatmapCard } from "./HeatmapCard";
import { getMockHeatmapData } from "./mock";
import { HEATMAP_SCHEMA, type HeatmapOptions } from "./schema";

// `weeks` only affects derivation (how much of the same full history to
// slice into the grid), so it stays out of fetchRawData's cache key.
async function fetchHeatmapRawData(options: HeatmapOptions): Promise<FullContributionData> {
  return fetchContributionData(options.username);
}

function computeHeatmapData(raw: FullContributionData): FullContributionData {
  // The card itself calls buildHeatmapGrid (it also needs contributionDays
  // for the tooltip/`<title>` per cell), so computeData just passes the
  // slice of raw data through — toJson below is what actually shapes it.
  return raw;
}

function renderHeatmapSvg(data: FullContributionData, options: HeatmapOptions): string {
  return renderJsxToSvg(
    HeatmapCard({
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
      hideMonthLabels: options.hide_month_labels,
      hideWeekdayLabels: options.hide_weekday_labels,
      hideLegend: options.hide_legend,
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      hideTitle: options.hide_title,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
      width: options.card_width,
    })
  );
}

function heatmapToJson(data: FullContributionData, options: HeatmapOptions): HeatmapGrid {
  return buildHeatmapGrid(data.contributionDays, options.weeks, options.locale);
}

registerWidget({
  type: "heatmap",
  schema: HEATMAP_SCHEMA,
  cacheSecondsDefault: 3600,
  fetchRawData: fetchHeatmapRawData,
  computeData: computeHeatmapData,
  renderSvg: renderHeatmapSvg,
  toJson: heatmapToJson,
  mockRawData: () => getMockHeatmapData(),
});

export type { HeatmapOptions } from "./schema";
