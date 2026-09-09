"use client";

import { useState } from "react";
import { AlertCircle, ImageIcon, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDashboard } from "./context";
import { GenerateButton } from "./GenerateButton";

type LoadState = "loading" | "loaded" | "error";

/** The rendered widget (docs/TODOS.md 12.4 / 12.11). */
export function Canvas() {
  const { state, entry } = useDashboard();
  const rendered = state.rendered;
  const [load, setLoad] = useState<LoadState>("loading");
  const [loadedFor, setLoadedFor] = useState(rendered);

  // Reset the loading state when a new render comes in, computed during
  // render (not an effect) per https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (rendered !== loadedFor) {
    setLoadedFor(rendered);
    if (rendered) setLoad("loading");
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "relative rounded-xl border bg-[repeating-conic-gradient(var(--color-muted)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-6 sm:p-10 flex items-center justify-center min-h-64",
          // Stale: the canvas no longer matches the form, and says so rather
          // than quietly chasing every edit (D11 / task 12.9).
          state.dirty && rendered && "opacity-60"
        )}
      >
        {!rendered && <EmptyCanvas />}

        {rendered && load === "error" && <RenderError live={rendered.dataMode === "live"} />}

        {rendered && (
          <>
            {load === "loading" && <Skeleton className="absolute inset-6 sm:inset-10 rounded-lg" />}
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamically generated SVG; next/image does not apply */}
            <img
              key={rendered.src}
              src={rendered.src}
              alt={`${entry.label} preview`}
              onLoad={() => setLoad("loaded")}
              onError={() => setLoad("error")}
              className={cn(
                "max-w-full h-auto rounded-lg transition-opacity",
                load === "loaded" ? "opacity-100" : "opacity-0"
              )}
            />
          </>
        )}

        {rendered && (
          <Badge
            variant={rendered.dataMode === "live" ? "default" : "secondary"}
            className="absolute top-2.5 right-2.5 text-[10px]"
          >
            {rendered.dataMode === "live" ? "Live data" : "Sample data"}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px] text-muted-foreground">
          {state.dirty && rendered
            ? "Settings changed — regenerate to see them."
            : rendered?.dataMode === "sample"
              ? "Sample data, not your real GitHub stats — fill in the identifying field and Generate to fetch your own."
              : rendered
                ? "Rendered from your real GitHub data."
                : "Press Generate to render this widget."}
        </p>
        <GenerateButton />
      </div>
    </div>
  );
}

function EmptyCanvas() {
  return (
    <div className="text-center max-w-xs">
      <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
        <ImageIcon className="size-5" />
      </div>
      <p className="text-sm font-medium mb-1">Nothing rendered yet</p>
      <p className="text-xs text-muted-foreground">
        Pick a widget, adjust the options, then press <Sparkles className="inline size-3 -mt-0.5" /> Generate. Nothing
        is fetched until you do.
      </p>
    </div>
  );
}

function RenderError({ live }: { live: boolean }) {
  return (
    <div className="text-center max-w-sm">
      <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-5" />
      </div>
      <p className="text-sm font-medium mb-1">That render failed</p>
      <p className="text-xs text-muted-foreground">
        {live
          ? "Live mode hits the real GitHub API — check the username or repo exists, that the server has a GITHUB_TOKEN configured, and that you have not hit the rate limit."
          : "The widget endpoint returned an error. Check any option shown in red, or reset the options and try again."}
      </p>
    </div>
  );
}
