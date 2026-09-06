import { fetchProductiveTimeData, type RawProductiveTimeData } from "@/lib/githubStats";
import { computeProductiveTime, type ProductiveTimeResult } from "@/lib/productiveTime";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { ProductiveTimeCard } from "./ProductiveTimeCard";
import { getMockProductiveTimeData } from "./mock";
import { PRODUCTIVE_TIME_SCHEMA, type ProductiveTimeOptions } from "./schema";

async function fetchProductiveTimeRawData(options: ProductiveTimeOptions): Promise<RawProductiveTimeData> {
  return fetchProductiveTimeData(options.username);
}

function computeProductiveTimeData(raw: RawProductiveTimeData, options: ProductiveTimeOptions): ProductiveTimeResult {
  return computeProductiveTime(raw.commitDates, options.timezone || "UTC");
}

function renderProductiveTimeSvg(data: ProductiveTimeResult, options: ProductiveTimeOptions): string {
  return renderJsxToSvg(
    ProductiveTimeCard({
      data,
      hideHourOfDay: options.hide_hour_of_day,
      hideDayOfWeek: options.hide_day_of_week,
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

function productiveTimeToJson(data: ProductiveTimeResult): unknown {
  return data;
}

registerWidget({
  type: "productive-time",
  schema: PRODUCTIVE_TIME_SCHEMA,
  cacheSecondsDefault: 3600,
  fetchRawData: fetchProductiveTimeRawData,
  computeData: computeProductiveTimeData,
  renderSvg: renderProductiveTimeSvg,
  toJson: productiveTimeToJson,
  mockRawData: () => getMockProductiveTimeData(),
});

export type { ProductiveTimeOptions } from "./schema";
