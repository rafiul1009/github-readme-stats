import { fetchWakaTimeStats, type RawWakaTimeData } from "@/lib/wakatime";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { WakaTimeCard } from "./WakaTimeCard";
import { getMockWakaTimeData } from "./mock";
import { WAKATIME_SCHEMA, type WakaTimeOptions } from "./schema";

async function fetchWakaTimeRawData(options: WakaTimeOptions): Promise<RawWakaTimeData> {
  return fetchWakaTimeStats(options.username, options.api_domain);
}

function computeWakaTimeData(raw: RawWakaTimeData): RawWakaTimeData {
  return raw;
}

function renderWakaTimeSvg(data: RawWakaTimeData, options: WakaTimeOptions): string {
  return renderJsxToSvg(
    WakaTimeCard({
      data,
      username: options.username,
      layout: options.layout,
      displayFormat: options.display_format,
      langsCount: options.langs_count,
      hideProgress: options.hide_progress,
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
      width: options.card_width,
    })
  );
}

function wakaTimeToJson(data: RawWakaTimeData): unknown {
  return data;
}

registerWidget({
  type: "wakatime",
  schema: WAKATIME_SCHEMA,
  cacheSecondsDefault: 3600,
  requiresGithubToken: false,
  dataCacheKeySuffix: (options) => options.api_domain,
  fetchRawData: fetchWakaTimeRawData,
  computeData: computeWakaTimeData,
  renderSvg: renderWakaTimeSvg,
  toJson: wakaTimeToJson,
  mockRawData: () => getMockWakaTimeData(),
});

export type { WakaTimeOptions } from "./schema";
