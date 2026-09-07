"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { escapeXml } from "@/lib/escape";
import { getTheme } from "@/lib/themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDashboard } from "./context";
import { buildQueryString, fieldValue } from "./query";
import { embedUrl, identifyingValue } from "./state";
import { buildWorkflowYaml, suggestedOutputPath } from "./workflowYaml";

/** Themes with a known light/dark counterpart, for the `<picture>` dark-mode snippet. */
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

function pairedTheme(theme: string, want: "light" | "dark", current: "light" | "dark"): string {
  if (current === want) return theme;
  return THEME_PAIRS[theme] ?? (want === "dark" ? "dark" : "default");
}

/** The copy-out block (docs/TODOS.md 12.17) — the old CopyPanel as shadcn tabs. */
export function CopyOutPanel({ origin }: { origin: string }) {
  const { state, entry, schema } = useDashboard();
  const identifier = identifyingValue(state);

  if (entry.identifyingField && !identifier) {
    return (
      <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-4">
        Enter a {entry.identifyingField.replace(/_/g, " ")} to generate an embeddable link.
      </p>
    );
  }

  const url = embedUrl(state, origin);
  const alt = escapeXml(`${identifier || entry.label} — ${entry.label}`);
  const themeName = (fieldValue(schema, state.form, "theme") as string) ?? "default";
  const mode = getTheme(themeName).mode;
  const withTheme = (theme: string) =>
    `${origin}/api/widget/${entry.type}?${buildQueryString(schema, { ...state.form, theme })}`;
  const join = (suffix: string) => (url.includes("?") ? `${url}&${suffix}` : `${url}?${suffix}`);

  const outputPath = suggestedOutputPath(entry.type);

  const snippets = [
    { key: "md", label: "Markdown", content: `![${alt}](${url})` },
    { key: "html", label: "HTML", content: `<img src="${url}" alt="${alt}" />` },
    {
      key: "picture",
      label: "Auto dark",
      content: `<picture>\n  <source srcset="${withTheme(pairedTheme(themeName, "dark", mode))}" media="(prefers-color-scheme: dark)" />\n  <source srcset="${withTheme(pairedTheme(themeName, "light", mode))}" media="(prefers-color-scheme: light)" />\n  <img src="${url}" alt="${alt}" />\n</picture>`,
      note: "GitHub swaps these automatically with the reader's colour scheme.",
    },
    { key: "url", label: "URL", content: url },
    { key: "json", label: "JSON", content: join("format=json"), note: "The underlying numbers, no rendering." },
    { key: "png", label: "PNG", content: join("format=png"), note: "Static raster — animations are disabled." },
    {
      key: "action",
      label: "Action",
      content: buildWorkflowYaml(url, outputPath),
      note: `Save as .github/workflows/update-widget.yml in your profile repo. It renders this widget on a schedule and commits the SVG to ${outputPath}, so your README embeds a file you own rather than a live link to this service.`,
      extra: { label: "README markdown (after the first run)", content: `![${alt}](./${outputPath})` },
    },
  ];

  return (
    <Tabs defaultValue="md" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        {snippets.map((s) => (
          <TabsTrigger key={s.key} value={s.key} className="text-xs">
            {s.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {snippets.map((s) => (
        <TabsContent key={s.key} value={s.key} className="mt-3 flex flex-col gap-2">
          {s.note && <p className="text-[11px] text-muted-foreground">{s.note}</p>}
          <Snippet content={s.content} />
          {s.extra && (
            <>
              <p className="text-[11px] text-muted-foreground mt-1">{s.extra.label}</p>
              <Snippet content={s.extra.content} />
            </>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function Snippet({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API needs a secure context and permission; the text stays
      // selectable in the <pre> either way.
      toast.error("Could not copy — select the text and copy manually.");
    }
  }

  return (
    <div className="relative group">
      <pre className="text-[11px] font-mono border rounded-lg bg-muted/50 p-3 pr-12 overflow-x-auto whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
        {content}
      </pre>
      <Button
        variant="secondary"
        size="icon"
        onClick={copy}
        aria-label="Copy to clipboard"
        className="absolute top-2 right-2 size-8"
      >
        {copied ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  );
}
