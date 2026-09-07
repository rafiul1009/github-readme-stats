"use client";

import { useEffect, useState } from "react";
import { Palette, Images, LayoutTemplate, PanelLeftClose, PanelRightClose } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDashboard } from "./context";
import { TopBar } from "./TopBar";
import { Canvas } from "./Canvas";
import { CopyOutPanel } from "./CopyOutPanel";
import { WidgetCatalogPanel } from "./WidgetCatalogPanel";
import { OptionsPanel } from "./OptionsPanel";
import { ThemesPanel } from "./ThemesPanel";
import { GalleryPanel } from "./GalleryPanel";
import { GenerateButton } from "./GenerateButton";
import { ReadmeSidebar } from "./readme/ReadmeSidebar";
import { ReadmeCanvas } from "./readme/ReadmeCanvas";
import { TemplatesPanel } from "./readme/TemplatesPanel";
import type { Panel } from "./state";
import { syncPermalink } from "./permalink";

/**
 * The dashboard shell (docs/TODOS.md 12.4 / 12.5 / 12.33-12.36 / 12.45).
 *
 * Breakpoint contract, per PLAN.md §9.7. Widget mode's left side is **two**
 * docked columns from `lg` — the widget catalogue and its option accordion
 * side by side rather than stacked in one scroll region (task 12.45), so
 * picking a widget and tuning it don't compete for the same vertical space.
 * README mode keeps a single sidebar (`ReadmeSidebar`), since it has no
 * separate "pick one of many" catalogue browsing step.
 *
 *   < 640px   one column, both sidebars are Sheets, sticky bottom Generate
 *   640-1023  one column + Sheets, but denser grids inside the panels
 *   1024-1279 left column(s) docked, right sidebar a Sheet
 *   >= 1280   full shell, right sidebar docked too
 */
export function Shell() {
  const { state } = useDashboard();
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  // The permalink is written on generate and on structural switches, never per
  // keystroke — the same rule the render itself follows (task 12.12).
  useEffect(() => {
    syncPermalink(state);
  }, [state.renderNonce, state.mode, state.panel, state.widgetType, state]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar onToggleLeft={() => setLeftOpen(true)} onToggleRight={() => setRightOpen(true)} />

      <div className="flex flex-1 min-h-0">
        {state.mode === "widget" ? (
          <>
            {/* Widget catalogue — its own docked column (task 12.45). */}
            <aside className="hidden lg:flex w-56 xl:w-64 shrink-0 flex-col border-r bg-sidebar/40">
              <ScrollArea className="flex-1">
                <div className="p-3">
                  <WidgetCatalogPanel />
                </div>
              </ScrollArea>
            </aside>

            {/* That widget's options — a second, wider docked column. */}
            <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col border-r bg-sidebar/40">
              <ScrollArea className="flex-1">
                <div className="p-3">
                  <OptionsPanel />
                </div>
              </ScrollArea>
            </aside>
          </>
        ) : (
          <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col border-r bg-sidebar/40">
            <ScrollArea className="flex-1">
              <div className="p-3">
                <ReadmeSidebar />
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Canvas. */}
        <main className="flex-1 min-w-0 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="mx-auto w-full max-w-4xl p-3 sm:p-6 flex flex-col gap-6">
              {state.mode === "widget" ? (
                <>
                  <Canvas />
                  <section>
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Embed
                    </h2>
                    <CopyOutPanel origin={origin} />
                  </section>
                </>
              ) : (
                <ReadmeCanvas origin={origin} />
              )}

              {/* The second Generate (task 12.10) — always reachable after scrolling the canvas. */}
              <div className="hidden sm:flex justify-center pt-2 pb-6">
                <GenerateButton size="lg" />
              </div>
            </div>
          </ScrollArea>

          {/* Phones get it as a sticky bar instead, so it never needs scrolling to (task 12.33). */}
          <div className="sm:hidden shrink-0 border-t bg-background/95 backdrop-blur p-2">
            <GenerateButton className="w-full h-11" />
          </div>
        </main>

        {/* Right sidebar — docked only at xl (task 12.36). */}
        <aside className="hidden xl:flex w-80 shrink-0 flex-col border-l bg-sidebar/40">
          <RightContent />
        </aside>
      </div>

      {/* --- Drawer equivalents below the docking breakpoints (task 12.5) --- */}
      <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-sm p-0 flex flex-col">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2 text-sm">
              <PanelLeftClose className="size-4" />
              {state.mode === "widget" ? "Widgets & options" : "README contents"}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1">
            {/* The Sheet is space-constrained, so mobile keeps both columns
                stacked in one scroll region rather than the desktop's
                side-by-side split. */}
            <div className="p-3">
              <LeftContent />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={rightOpen} onOpenChange={setRightOpen}>
        <SheetContent side="right" className="w-[88vw] max-w-sm p-0 flex flex-col">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2 text-sm">
              <PanelRightClose className="size-4" />
              Themes & gallery
            </SheetTitle>
          </SheetHeader>
          <RightContent />
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** The mobile/tablet drawer's combined content — see the Sheet above. */
function LeftContent() {
  const { state } = useDashboard();

  if (state.mode === "readme") return <ReadmeSidebar />;

  return (
    <div className="flex flex-col gap-4">
      <WidgetCatalogPanel bounded />
      <Separator />
      <OptionsPanel />
    </div>
  );
}

const PANEL_TABS: { value: Panel; label: string; icon: typeof Palette; modes: ("widget" | "readme")[] }[] = [
  { value: "themes", label: "Themes", icon: Palette, modes: ["widget", "readme"] },
  { value: "gallery", label: "Gallery", icon: Images, modes: ["widget", "readme"] },
  { value: "templates", label: "Templates", icon: LayoutTemplate, modes: ["readme"] },
];

function RightContent() {
  const { state, dispatch } = useDashboard();
  const tabs = PANEL_TABS.filter((t) => t.modes.includes(state.mode));

  return (
    <Tabs
      value={state.panel}
      onValueChange={(panel) => dispatch({ type: "setPanel", panel: panel as Panel })}
      className="flex flex-col flex-1 min-h-0"
    >
      <div className="p-2 border-b">
        {/* An interpolated `grid-cols-${n}` is invisible to Tailwind's scanner, so map it. */}
        <TabsList className={cn("w-full grid", tabs.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="text-xs gap-1.5">
              <Icon className="size-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {/* Each panel only mounts while its tab is active, so the gallery's
              ~24 sample renders are not paid for on every dashboard load. */}
          <TabsContent value="themes">
            <ThemesPanel />
          </TabsContent>
          <TabsContent value="gallery">
            <GalleryPanel />
          </TabsContent>
          {state.mode === "readme" && (
            <TabsContent value="templates">
              <TemplatesPanel />
            </TabsContent>
          )}
        </div>
      </ScrollArea>
    </Tabs>
  );
}
