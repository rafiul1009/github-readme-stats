import { fetchCommitLanguageData, repoScopeCacheKeySuffix, type RawCommitLanguageData } from "@/lib/githubStats";
import { aggregateCommitLanguages, type CommitLanguageStat } from "@/lib/commitLanguages";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { MostCommitLanguageCard } from "./MostCommitLanguageCard";
import { getMockCommitLanguageData } from "./mock";
import { MOST_COMMIT_LANGUAGE_SCHEMA, type MostCommitLanguageOptions } from "./schema";

// role/owner (docs/TODOS.md 10.3) change what's fetched, so they need a
// data-cache key suffix (below) rather than living in computeData.
async function fetchMostCommitLanguageRawData(options: MostCommitLanguageOptions): Promise<RawCommitLanguageData> {
  return fetchCommitLanguageData(options.username, {
    role: options.role,
    owner: options.owner as string | undefined,
  });
}

function mostCommitLanguageDataCacheKeySuffix(options: MostCommitLanguageOptions): string {
  return repoScopeCacheKeySuffix({ role: options.role, owner: options.owner as string | undefined });
}

function computeMostCommitLanguageData(raw: RawCommitLanguageData, options: MostCommitLanguageOptions): CommitLanguageStat[] {
  return aggregateCommitLanguages(raw, options.hide).slice(0, options.langs_count);
}

function renderMostCommitLanguageSvg(data: CommitLanguageStat[], options: MostCommitLanguageOptions): string {
  return renderJsxToSvg(
    MostCommitLanguageCard({
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

function mostCommitLanguageToJson(data: CommitLanguageStat[]): unknown {
  return data;
}

registerWidget({
  type: "most-commit-language",
  schema: MOST_COMMIT_LANGUAGE_SCHEMA,
  cacheSecondsDefault: 3600,
  dataCacheKeySuffix: mostCommitLanguageDataCacheKeySuffix,
  fetchRawData: fetchMostCommitLanguageRawData,
  computeData: computeMostCommitLanguageData,
  renderSvg: renderMostCommitLanguageSvg,
  toJson: mostCommitLanguageToJson,
  mockRawData: () => getMockCommitLanguageData(),
});

export type { MostCommitLanguageOptions } from "./schema";
