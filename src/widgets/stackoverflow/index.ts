import { fetchStackOverflowStats, type StackOverflowStats } from "@/lib/stackoverflow";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { StackOverflowCard } from "./StackOverflowCard";
import { getMockStackOverflowStats } from "./mock";
import { STACKOVERFLOW_SCHEMA, type StackOverflowOptions } from "./schema";

async function fetchStackOverflowRawData(options: StackOverflowOptions): Promise<StackOverflowStats> {
  return fetchStackOverflowStats(options.user_id as string);
}

function computeStackOverflowData(raw: StackOverflowStats): StackOverflowStats {
  return raw;
}

function renderStackOverflowSvg(data: StackOverflowStats, options: StackOverflowOptions): string {
  return renderJsxToSvg(
    StackOverflowCard({
      stats: data,
      customTitle: options.custom_title,
      theme: getTheme(options.theme),
      overrides: {
        background: options.bg_color,
        border: options.border_color,
        title: options.title_color,
        text: options.text_color,
      },
      locale: options.locale,
      numberFormat: options.number_format,
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      hideTitle: options.hide_title,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
      width: options.card_width,
    })
  );
}

function stackOverflowToJson(data: StackOverflowStats): unknown {
  return data;
}

registerWidget({
  type: "stackoverflow",
  schema: STACKOVERFLOW_SCHEMA,
  cacheSecondsDefault: 3600,
  requiresUsername: false,
  requiresGithubToken: false,
  dataCacheKeyBase: (options) => options.user_id as string | undefined,
  fetchRawData: fetchStackOverflowRawData,
  computeData: computeStackOverflowData,
  renderSvg: renderStackOverflowSvg,
  toJson: stackOverflowToJson,
  mockRawData: () => getMockStackOverflowStats(),
});

export type { StackOverflowOptions } from "./schema";
