import { fetchLanguageData, type RawLanguageData } from "@/lib/githubStats";
import { aggregateLanguages, type LanguageStat } from "@/lib/languages";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { TopLangsCard } from "./TopLangsCard";
import { getMockLanguageData } from "./mock";
import { TOP_LANGS_SCHEMA, type TopLangsOptions } from "./schema";

async function fetchTopLangsRawData(options: TopLangsOptions): Promise<RawLanguageData> {
  return fetchLanguageData(options.username);
}

function computeTopLangsData(raw: RawLanguageData, options: TopLangsOptions): LanguageStat[] {
  return aggregateLanguages(raw, {
    excludeRepos: options.exclude_repo,
    hide: options.hide,
    sizeWeight: options.size_weight,
    countWeight: options.count_weight,
  });
}

function renderTopLangsSvg(data: LanguageStat[], options: TopLangsOptions): string {
  return renderJsxToSvg(
    TopLangsCard({
      languages: data,
      layout: options.layout,
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
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      hideTitle: options.hide_title,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
      width: options.card_width,
    })
  );
}

function topLangsToJson(data: LanguageStat[]): unknown {
  return data;
}

registerWidget({
  type: "top-langs",
  schema: TOP_LANGS_SCHEMA,
  cacheSecondsDefault: 3600,
  fetchRawData: fetchTopLangsRawData,
  computeData: computeTopLangsData,
  renderSvg: renderTopLangsSvg,
  toJson: topLangsToJson,
  mockRawData: () => getMockLanguageData(),
});

export type { TopLangsOptions } from "./schema";
