import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { TypingHeaderCard } from "./TypingHeaderCard";
import { getMockTypingHeaderData } from "./mock";
import { TYPING_HEADER_SCHEMA, type TypingHeaderOptions } from "./schema";

async function fetchTypingHeaderRawData(): Promise<Record<string, never>> {
  return {};
}

function computeTypingHeaderData(raw: Record<string, never>): Record<string, never> {
  return raw;
}

function renderTypingHeaderSvg(_data: Record<string, never>, options: TypingHeaderOptions): string {
  return renderJsxToSvg(
    TypingHeaderCard({
      lines: options.lines,
      font: options.font,
      size: options.size,
      duration: options.duration,
      pause: options.pause,
      multiline: options.multiline,
      hideCursor: options.hide_cursor,
      theme: getTheme(options.theme),
      overrides: {
        background: options.bg_color,
        border: options.border_color,
        text: options.text_color,
        cursor: options.icon_color,
      },
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
      width: options.card_width,
      height: options.card_height,
    })
  );
}

function typingHeaderToJson(_data: Record<string, never>, options: TypingHeaderOptions): unknown {
  return { lines: options.lines };
}

registerWidget({
  type: "typing-header",
  schema: TYPING_HEADER_SCHEMA,
  cacheSecondsDefault: 86400,
  requiresUsername: false,
  requiresGithubToken: false,
  dataCacheKeyBase: () => "static",
  fetchRawData: fetchTypingHeaderRawData,
  computeData: computeTypingHeaderData,
  renderSvg: renderTypingHeaderSvg,
  toJson: typingHeaderToJson,
  mockRawData: () => getMockTypingHeaderData(),
});

export type { TypingHeaderOptions } from "./schema";
