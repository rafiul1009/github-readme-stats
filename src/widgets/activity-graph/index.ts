import { fetchContributionData, type FullContributionData } from "@/lib/github";
import { aggregateActivity, chooseGranularity, type ActivityPoint, type ActivityGranularity } from "@/lib/activity";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { ActivityGraphCard } from "./ActivityGraphCard";
import { getMockActivityData } from "./mock";
import { ACTIVITY_GRAPH_SCHEMA, type ActivityGraphOptions } from "./schema";

interface ActivityGraphData {
  points: ActivityPoint[];
  granularity: ActivityGranularity;
}

// days/granularity only affect derivation (which slice/bucketing of the same
// full contribution history to show), not what's fetched, so they stay out
// of fetchRawData per the registry's cache-key guidance.
async function fetchActivityGraphRawData(options: ActivityGraphOptions): Promise<FullContributionData> {
  return fetchContributionData(options.username);
}

function computeActivityGraphData(raw: FullContributionData, options: ActivityGraphOptions): ActivityGraphData {
  const granularity = options.granularity === "auto" ? chooseGranularity(options.days) : options.granularity;
  return {
    points: aggregateActivity(raw.contributionDays, { days: options.days, granularity: options.granularity }),
    granularity,
  };
}

function renderActivityGraphSvg(data: ActivityGraphData, options: ActivityGraphOptions): string {
  return renderJsxToSvg(
    ActivityGraphCard({
      points: data.points,
      granularity: data.granularity,
      style: options.graph_style,
      showPoints: options.show_points,
      hideGrid: options.hide_grid,
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
      numberFormat: options.number_format,
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      hideTitle: options.hide_title,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
      width: options.card_width,
      height: options.card_height,
    })
  );
}

function activityGraphToJson(data: ActivityGraphData): unknown {
  return data;
}

registerWidget({
  type: "activity-graph",
  schema: ACTIVITY_GRAPH_SCHEMA,
  cacheSecondsDefault: 3600,
  fetchRawData: fetchActivityGraphRawData,
  computeData: computeActivityGraphData,
  renderSvg: renderActivityGraphSvg,
  toJson: activityGraphToJson,
  mockRawData: () => getMockActivityData(),
});

export type { ActivityGraphOptions } from "./schema";
