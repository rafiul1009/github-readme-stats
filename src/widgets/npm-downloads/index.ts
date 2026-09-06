import { fetchNpmPackageStats, type NpmPackageStats } from "@/lib/npmStats";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { NpmDownloadsCard } from "./NpmDownloadsCard";
import { getMockNpmStats } from "./mock";
import { NPM_DOWNLOADS_SCHEMA, type NpmDownloadsOptions } from "./schema";

async function fetchNpmDownloadsRawData(options: NpmDownloadsOptions): Promise<NpmPackageStats> {
  return fetchNpmPackageStats(options.package as string);
}

function computeNpmDownloadsData(raw: NpmPackageStats): NpmPackageStats {
  return raw;
}

function renderNpmDownloadsSvg(data: NpmPackageStats, options: NpmDownloadsOptions): string {
  return renderJsxToSvg(
    NpmDownloadsCard({
      stats: data,
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

function npmDownloadsToJson(data: NpmPackageStats): unknown {
  return data;
}

registerWidget({
  type: "npm-downloads",
  schema: NPM_DOWNLOADS_SCHEMA,
  cacheSecondsDefault: 21600,
  requiresUsername: false,
  requiresGithubToken: false,
  dataCacheKeyBase: (options) => options.package as string | undefined,
  fetchRawData: fetchNpmDownloadsRawData,
  computeData: computeNpmDownloadsData,
  renderSvg: renderNpmDownloadsSvg,
  toJson: npmDownloadsToJson,
  mockRawData: () => getMockNpmStats(),
});

export type { NpmDownloadsOptions } from "./schema";
