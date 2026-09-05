"use client";

import { useState } from "react";
import { escapeXml } from "@/lib/escape";

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
}

export function CopyPanel({ imageUrl, altText, themeName, themeMode, buildUrlWithTheme }: CopyPanelProps) {
  const safeAlt = escapeXml(altText);
  const markdown = `![${safeAlt}](${imageUrl})`;
  const html = `<img src="${imageUrl}" alt="${safeAlt}" />`;

  const lightUrl = buildUrlWithTheme(pairedTheme(themeName, "light", themeMode));
  const darkUrl = buildUrlWithTheme(pairedTheme(themeName, "dark", themeMode));
  const picture = `<picture>\n  <source srcset="${darkUrl}" media="(prefers-color-scheme: dark)" />\n  <source srcset="${lightUrl}" media="(prefers-color-scheme: light)" />\n  <img src="${imageUrl}" alt="${safeAlt}" />\n</picture>`;

  const jsonUrl = imageUrl.includes("?") ? `${imageUrl}&format=json` : `${imageUrl}?format=json`;

  return (
    <div className="flex flex-col gap-3">
      <CopyBlock title="Markdown" content={markdown} />
      <CopyBlock title="HTML" content={html} />
      <CopyBlock title="HTML (auto dark mode)" content={picture} />
      <CopyBlock title="Raw URL" content={imageUrl} />
      <CopyBlock title="JSON endpoint" content={jsonUrl} />
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
