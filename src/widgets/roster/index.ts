import { fetchRepoRoster, parseOwnerRepo } from "@/lib/githubRepo";
import { fetchAvatarDataUri } from "@/lib/avatar";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { RosterCard } from "./RosterCard";
import { getMockRosterData, type RawRosterCardData } from "./mock";
import { ROSTER_SCHEMA, type RosterOptions } from "./schema";

// `limit`/`kind` change what's fetched (a different query, a different
// page size), so they need a data-cache key suffix rather than living in
// computeData.
async function fetchRosterRawData(options: RosterOptions): Promise<RawRosterCardData> {
  const { owner, name } = parseOwnerRepo(options.repo);
  const roster = await fetchRepoRoster(owner, name, options.kind, options.limit);
  // Avatars are embedded as base64 data URIs (same reason as the profile
  // card — README renderers proxy an <img> through camo, which can't reach
  // into an <svg><image> the way it can an <img src>), fetched once here
  // and cached alongside the rest of the raw data rather than re-fetched
  // on every render within the cache window.
  const avatars = await Promise.all(
    roster.entries.map(async (entry) => ({
      login: entry.login,
      dataUri: await fetchAvatarDataUri(entry.avatarUrl, 80),
    }))
  );
  return { totalCount: roster.totalCount, avatars };
}

function rosterDataCacheKeySuffix(options: RosterOptions): string {
  return `${options.kind}:${options.limit}`;
}

function computeRosterData(raw: RawRosterCardData): RawRosterCardData {
  return raw;
}

function renderRosterSvg(data: RawRosterCardData, options: RosterOptions): string {
  return renderJsxToSvg(
    RosterCard({
      avatars: data.avatars,
      totalCount: data.totalCount,
      kind: options.kind,
      columns: options.columns,
      size: options.size,
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
    })
  );
}

function rosterToJson(data: RawRosterCardData): unknown {
  return { totalCount: data.totalCount, logins: data.avatars.map((a) => a.login) };
}

registerWidget({
  type: "roster",
  schema: ROSTER_SCHEMA,
  cacheSecondsDefault: 3600,
  requiresUsername: false,
  dataCacheKeyBase: (options) => options.repo,
  dataCacheKeySuffix: rosterDataCacheKeySuffix,
  fetchRawData: fetchRosterRawData,
  computeData: computeRosterData,
  renderSvg: renderRosterSvg,
  toJson: rosterToJson,
  mockRawData: () => getMockRosterData(),
});

export type { RosterOptions } from "./schema";
