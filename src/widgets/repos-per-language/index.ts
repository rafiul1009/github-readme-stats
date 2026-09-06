import { fetchLanguageData, type RawLanguageData } from "@/lib/githubStats";
import { aggregateLanguages, type LanguageStat } from "@/lib/languages";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { ReposPerLanguageCard } from "./ReposPerLanguageCard";
import { getMockLanguageData } from "./mock";
import { REPOS_PER_LANGUAGE_SCHEMA, type ReposPerLanguageOptions } from "./schema";

async function fetchReposPerLanguageRawData(options: ReposPerLanguageOptions): Promise<RawLanguageData> {
  return fetchLanguageData(options.username);
}

function computeReposPerLanguageData(raw: RawLanguageData, options: ReposPerLanguageOptions): LanguageStat[] {
  const languages = aggregateLanguages(raw, { excludeRepos: options.exclude_repo, hide: options.hide });
  return languages
    .slice()
    .sort((a, b) => b.repoCount - a.repoCount)
    .slice(0, options.langs_count);
}

function renderReposPerLanguageSvg(data: LanguageStat[], options: ReposPerLanguageOptions): string {
  return renderJsxToSvg(
    ReposPerLanguageCard({
      languages: data,
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

function reposPerLanguageToJson(data: LanguageStat[]): unknown {
  return data;
}

registerWidget({
  type: "repos-per-language",
  schema: REPOS_PER_LANGUAGE_SCHEMA,
  cacheSecondsDefault: 3600,
  fetchRawData: fetchReposPerLanguageRawData,
  computeData: computeReposPerLanguageData,
  renderSvg: renderReposPerLanguageSvg,
  toJson: reposPerLanguageToJson,
  mockRawData: () => getMockLanguageData(),
});

export type { ReposPerLanguageOptions } from "./schema";
