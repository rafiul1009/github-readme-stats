"use client";

import { useState } from "react";
import { escapeXml } from "@/lib/escape";
import { buildWorkflowYaml, suggestedOutputPath } from "./workflowYaml";

/** Themes with a known light/dark counterpart, for the <picture> dark-mode snippet (task 1.13). */
const THEME_PAIRS: Record<string, string> = {
  default: "dark",
  dark: "default",
  gruvbox: "gruvbox-light",
  "gruvbox-light": "gruvbox",
  "solarized-dark": "solarized-light",
  "solarized-light": "solarized-dark",
  "github-light": "github-dark",
  "github-dark": "github-light",
};

function pairedTheme(theme: string, mode: "light" | "dark", currentMode: "light" | "dark"): string {
  if (currentMode === mode) return theme;
  return THEME_PAIRS[theme] ?? (mode === "dark" ? "dark" : "default");
}

export interface CopyPanelProps {
  imageUrl: string;
  altText: string;
  themeName: string;
  themeMode: "light" | "dark";
  buildUrlWithTheme: (theme: string) => string;
  widgetType: string;
}

export function CopyPanel({ imageUrl, altText, themeName, themeMode, buildUrlWithTheme, widgetType }: CopyPanelProps) {
  const safeAlt = escapeXml(altText);
  const markdown = `![${safeAlt}](${imageUrl})`;
  const html = `<img src="${imageUrl}" alt="${safeAlt}" />`;

  const lightUrl = buildUrlWithTheme(pairedTheme(themeName, "light", themeMode));
  const darkUrl = buildUrlWithTheme(pairedTheme(themeName, "dark", themeMode));
  const picture = `<picture>\n  <source srcset="${darkUrl}" media="(prefers-color-scheme: dark)" />\n  <source srcset="${lightUrl}" media="(prefers-color-scheme: light)" />\n  <img src="${imageUrl}" alt="${safeAlt}" />\n</picture>`;

  const jsonUrl = imageUrl.includes("?") ? `${imageUrl}&format=json` : `${imageUrl}?format=json`;
  const pngUrl = imageUrl.includes("?") ? `${imageUrl}&format=png` : `${imageUrl}?format=png`;

  const outputPath = suggestedOutputPath(widgetType);
  const workflowYaml = buildWorkflowYaml(imageUrl, outputPath);
  const workflowMarkdown = `![${safeAlt}](./${outputPath})`;

  return (
    <div className="flex flex-col gap-3">
      <CopyBlock title="Markdown" content={markdown} />
      <CopyBlock title="HTML" content={html} />
      <CopyBlock title="HTML (auto dark mode)" content={picture} />
      <CopyBlock title="Raw URL" content={imageUrl} />
      <CopyBlock title="JSON endpoint" content={jsonUrl} />
      <CopyBlock title="PNG URL (static raster, no animation)" content={pngUrl} />

      <div className="border-t pt-3 mt-1">
        <p className="text-xs font-medium opacity-80 mb-1">GitHub Action (self-hosted, zero uptime dependency)</p>
        <p className="text-xs opacity-60 mb-2">
          Save as <code>.github/workflows/update-widget.yml</code> in your profile repo. It renders this
          widget on a schedule and commits the SVG to <code>{outputPath}</code>, so your README embeds a
          file in your own repo instead of a live link to this site.
        </p>
        <CopyBlock title="Workflow YAML" content={workflowYaml} />
        <CopyBlock title="README markdown (after the action runs once)" content={workflowMarkdown} />
      </div>
    </div>
  );
}

function CopyBlock({ title, content }: { title: string; content: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (permissions/context) — the text is still selectable below.
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium opacity-80">{title}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs px-2 py-0.5 rounded border hover:bg-black/5 dark:hover:bg-white/10"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="text-xs border rounded p-2 overflow-x-auto bg-black/[.03] dark:bg-white/[.05] whitespace-pre-wrap break-all">
        {content}
      </pre>
    </div>
  );
}
