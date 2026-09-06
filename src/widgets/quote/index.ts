import { pickRandomQuote, type Quote } from "@/lib/quotes";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { QuoteCard } from "./QuoteCard";
import { getMockQuoteData } from "./mock";
import { QUOTE_SCHEMA, type QuoteOptions } from "./schema";

async function fetchQuoteRawData(): Promise<Record<string, never>> {
  return {};
}

/**
 * The random pick happens here, not in fetchRawData — computeData is never
 * cached (docs on WidgetDefinition), which is exactly what "refresh a new
 * quote every load" (docs/TODOS.md 9.3) needs. `cacheSecondsDefault: 0`
 * below additionally keeps the *rendered SVG* from being memoized either.
 */
function computeQuoteData(_raw: Record<string, never>, options: QuoteOptions): Quote {
  return pickRandomQuote(options.category === "random" ? undefined : options.category);
}

function renderQuoteSvg(data: Quote, options: QuoteOptions): string {
  return renderJsxToSvg(
    QuoteCard({
      quote: data,
      theme: getTheme(options.theme),
      overrides: {
        background: options.bg_color,
        border: options.border_color,
        title: options.title_color,
        text: options.text_color,
        accent: options.icon_color,
      },
      locale: options.locale,
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
      width: options.card_width,
    })
  );
}

function quoteToJson(data: Quote): unknown {
  return data;
}

registerWidget({
  type: "quote",
  schema: QUOTE_SCHEMA,
  cacheSecondsDefault: 0,
  requiresUsername: false,
  requiresGithubToken: false,
  dataCacheKeyBase: () => "static",
  fetchRawData: fetchQuoteRawData,
  computeData: computeQuoteData,
  renderSvg: renderQuoteSvg,
  toJson: quoteToJson,
  mockRawData: () => getMockQuoteData(),
});

export type { QuoteOptions } from "./schema";
