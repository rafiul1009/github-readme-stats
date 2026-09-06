import { fetchUserStats } from "@/lib/githubStats";
import { fetchAvatarDataUri } from "@/lib/avatar";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { ProfileSummaryCard } from "./ProfileSummaryCard";
import { getMockProfileSummaryData, type RawProfileSummaryData } from "./mock";
import { PROFILE_SUMMARY_SCHEMA, type ProfileSummaryOptions } from "./schema";

const QUALITY_SOURCE_SIZE: Record<ProfileSummaryOptions["photo_quality"], number> = {
  low: 100,
  medium: 200,
  high: 400,
};

async function fetchProfileSummaryRawData(options: ProfileSummaryOptions): Promise<RawProfileSummaryData> {
  const stats = await fetchUserStats(options.username, true);
  const avatarDataUri = await fetchAvatarDataUri(stats.avatarUrl, QUALITY_SOURCE_SIZE[options.photo_quality]);
  return { stats, avatarDataUri };
}

function computeProfileSummaryData(raw: RawProfileSummaryData): RawProfileSummaryData {
  return raw;
}

function renderProfileSummarySvg(data: RawProfileSummaryData, options: ProfileSummaryOptions): string {
  return renderJsxToSvg(
    ProfileSummaryCard({
      stats: data.stats,
      avatarDataUri: data.avatarDataUri,
      photoResize: options.photo_resize,
      revert: options.revert,
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
    })
  );
}

function profileSummaryToJson(data: RawProfileSummaryData): unknown {
  return { ...data.stats, avatarDataUri: undefined };
}

registerWidget({
  type: "profile-summary",
  schema: PROFILE_SUMMARY_SCHEMA,
  cacheSecondsDefault: 3600,
  dataCacheKeySuffix: (options) => options.photo_quality,
  fetchRawData: fetchProfileSummaryRawData,
  computeData: computeProfileSummaryData,
  renderSvg: renderProfileSummarySvg,
  toJson: profileSummaryToJson,
  mockRawData: () => getMockProfileSummaryData(),
});

export type { ProfileSummaryOptions } from "./schema";
