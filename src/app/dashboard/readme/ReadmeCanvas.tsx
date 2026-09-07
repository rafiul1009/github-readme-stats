"use client";

import { useState } from "react";
import { Check, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { getWidgetCatalogEntry } from "@/widgets/catalog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDashboard } from "../context";
import { GenerateButton } from "../GenerateButton";
import { buildReadmeMarkdown } from "./exportReadme";
import { socialBadgeUrl, techBadgeUrl } from "./badges";
import { widgetPreviewUrl } from "./widgetUrl";

/**
 * README mode's canvas (docs/TODOS.md 12.18 / 12.20). Text edits — name, bio,
 * social handles — update the rendered preview immediately because they cost
 * no network; the *widget images* only refresh on Generate, same D11 rule as
 * widget mode.
 */
export function ReadmeCanvas({ origin }: { origin: string }) {
  const { state } = useDashboard();
  const profile = state.profile;
  const markdown = buildReadmeMarkdown(profile, origin || "https://profilecraft.app");

  return (
    <Tabs defaultValue="preview" className="w-full">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <TabsList>
          <TabsTrigger value="preview" className="text-xs">
            Preview
          </TabsTrigger>
          <TabsTrigger value="markdown" className="text-xs">
            README.md
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <CopyReadmeButton markdown={markdown} />
          <GenerateButton />
        </div>
      </div>

      <TabsContent value="preview">
        <div className="rounded-xl border bg-card p-4 sm:p-8">
          <ReadmePreview />
        </div>
      </TabsContent>

      <TabsContent value="markdown">
        <pre className="rounded-xl border bg-muted/50 p-4 text-[11px] font-mono whitespace-pre-wrap break-words max-h-[70vh] overflow-y-auto">
          {markdown}
        </pre>
      </TabsContent>
    </Tabs>
  );
}

function ReadmePreview() {
  const { state } = useDashboard();
  const profile = state.profile;
  const center = profile.align === "center";
  const empty =
    !profile.name && !profile.bio && profile.widgets.length === 0 && profile.socials.length === 0 && profile.techStack.length === 0;

  if (empty) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
          <FileText className="size-5" />
        </div>
        <p className="text-sm font-medium mb-1">Your README is empty</p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Fill in a name, add a widget or two, or start from a template in the right sidebar.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", center && "items-center text-center")}>
      {profile.name && <h1 className="text-2xl font-bold">Hi, I&apos;m {profile.name}</h1>}
      {profile.bio && <p className="text-sm text-muted-foreground max-w-prose">{profile.bio}</p>}

      {profile.socials.length > 0 && (
        <div className={cn("flex flex-wrap gap-1.5", center && "justify-center")}>
          {profile.socials.map((link) => {
            const badge = socialBadgeUrl(link);
            if (!badge) return null;
            /* eslint-disable-next-line @next/next/no-img-element -- external badge service */
            return <img key={link.id} src={badge} alt={link.platform} className="h-5" />;
          })}
        </div>
      )}

      {profile.techStack.length > 0 && (
        <div className={cn("flex flex-wrap gap-1.5", center && "justify-center")}>
          {profile.techStack.map((slug) => {
            const badge = techBadgeUrl(slug);
            if (!badge) return null;
            /* eslint-disable-next-line @next/next/no-img-element -- external badge service */
            return <img key={slug} src={badge} alt={slug} className="h-5" />;
          })}
        </div>
      )}

      {profile.widgets.length > 0 && (
        <div
          className={cn(
            "flex gap-3",
            profile.layout === "stacked" ? "flex-col" : "flex-row flex-wrap",
            center && "justify-center items-center"
          )}
        >
          {profile.widgets.map((instance) => {
            const entry = getWidgetCatalogEntry(instance.type);
            if (!entry) return null;
            return (
              /* eslint-disable-next-line @next/next/no-img-element -- dynamically generated SVG */
              <img
                // Keying on the render nonce is what makes these refetch on
                // Generate and not before (task 12.20).
                key={`${instance.id}-${state.renderNonce}`}
                src={`${widgetPreviewUrl(instance, profile.theme)}${
                  widgetPreviewUrl(instance, profile.theme).includes("?") ? "&" : "?"
                }_r=${state.renderNonce}`}
                alt={entry.label}
                loading="lazy"
                className="max-w-full rounded-lg border"
              />
            );
          })}
        </div>
      )}

      <Badge variant="secondary" className="text-[10px] mt-2">
        Widget images render from sample data — the exported README points at your real stats.
      </Badge>
    </div>
  );
}

function CopyReadmeButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast.success("README.md copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy — open the README.md tab and copy manually.");
    }
  }

  return (
    <Button variant="outline" onClick={copy} className="gap-2">
      {copied ? <Check className="size-4 text-brand" /> : <Download className="size-4" />}
      Copy README
    </Button>
  );
}
