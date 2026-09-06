import { fetchUserStats } from "@/lib/githubStats";
import { fetchRepoData, fetchRepoContributorCount, parseOwnerRepo } from "@/lib/githubRepo";
import { badgeScope, resolveBadges, type BadgeValue } from "@/lib/badges";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { WidgetRenderError } from "@/widgets/errors";
import { BadgesCard } from "./BadgesCard";
import { getMockBadgesData, type RawBadgesData } from "./mock";
import { BADGES_SCHEMA, type BadgesOptions } from "./schema";

async function fetchBadgesRawData(options: BadgesOptions): Promise<RawBadgesData> {
  const needsUser = options.name.some((n) => badgeScope(n) === "user");
  const needsRepo = options.name.some((n) => badgeScope(n) === "repo");

  if (needsUser && !options.username) {
    throw new WidgetRenderError("username is required for the requested badge type(s)", 400);
  }
  if (needsRepo && !options.repo) {
    throw new WidgetRenderError("repo is required for the requested badge type(s)", 400);
  }

  const [userStats, repoData] = await Promise.all([
    needsUser ? fetchUserStats(options.username, true) : Promise.resolve(undefined),
    needsRepo
      ? fetchRepoData(options.repo).then(async (repo) => {
          if (!options.name.includes("contributors")) return repo;
          const { owner, name } = parseOwnerRepo(options.repo);
          const contributors = await fetchRepoContributorCount(owner, name);
          return { ...repo, contributors };
        })
      : Promise.resolve(undefined),
  ]);

  return { userStats, repoData };
}

function computeBadgesData(raw: RawBadgesData, options: BadgesOptions): BadgeValue[] {
  return resolveBadges(options.name, raw.userStats, raw.repoData, options.number_format, options.locale);
}

function renderBadgesSvg(data: BadgeValue[], options: BadgesOptions): string {
  const themeNames = options.themes.length > 0 ? options.themes : [options.theme];
  const themes = themeNames.map((name) => getTheme(name));

  return renderJsxToSvg(
    BadgesCard({
      badges: data,
      themes,
      column: options.column,
      size: options.size,
      gap: options.p,
      glow: options.glow,
      wave: options.wave,
      customTitle: options.custom_title,
      overrides: {
        background: options.bg_color,
        border: options.border_color,
        title: options.title_color,
      },
      locale: options.locale,
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      hideTitle: options.hide_title,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
    })
  );
}

function badgesToJson(data: BadgeValue[]): unknown {
  return data;
}

registerWidget({
  type: "badges",
  schema: BADGES_SCHEMA,
  cacheSecondsDefault: 3600,
  requiresUsername: false,
  dataCacheKeyBase: (options) => (options.username && options.repo ? `${options.username}::${options.repo}` : options.username || options.repo),
  fetchRawData: fetchBadgesRawData,
  computeData: computeBadgesData,
  renderSvg: renderBadgesSvg,
  toJson: badgesToJson,
  mockRawData: () => getMockBadgesData(),
});

export type { BadgesOptions } from "./schema";
