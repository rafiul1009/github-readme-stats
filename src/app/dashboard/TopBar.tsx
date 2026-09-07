"use client";

import Link from "next/link";
import { PanelLeft, PanelRight, LayoutGrid, FileText } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDashboard } from "./context";
import { GenerateButton } from "./GenerateButton";
import { ThemeToggle } from "./ThemeToggle";
import type { Mode } from "./state";

const MODES: { value: Mode; label: string; short: string; icon: typeof LayoutGrid }[] = [
  { value: "widget", label: "Widget", short: "Widget", icon: LayoutGrid },
  { value: "readme", label: "README", short: "README", icon: FileText },
];

export interface TopBarProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
}

export function TopBar({ onToggleLeft, onToggleRight }: TopBarProps) {
  const { state, dispatch } = useDashboard();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2 sm:px-4 bg-background/80 backdrop-blur">
      <Button variant="ghost" size="icon" className="size-9 xl:hidden" aria-label="Toggle menu" onClick={onToggleLeft}>
        <PanelLeft className="size-4" />
      </Button>

      <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Profilecraft home">
        <Logo size={26} />
        <span className="font-semibold tracking-tight hidden sm:inline">Profilecraft</span>
      </Link>

      <Separator orientation="vertical" className="mx-1 h-6 hidden sm:block" />

      <div role="radiogroup" aria-label="Builder mode" className="inline-flex rounded-lg border bg-muted/40 p-0.5">
        {MODES.map(({ value, label, icon: Icon }) => {
          const active = state.mode === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => dispatch({ type: "setMode", mode: value })}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 h-8 text-xs font-medium transition-colors",
                active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {state.mode === "widget" && <GenerateButton className="hidden sm:inline-flex" />}

      <ThemeToggle />

      <Button
        variant="ghost"
        size="icon"
        className="size-9 xl:hidden"
        aria-label="Toggle themes and gallery"
        onClick={onToggleRight}
      >
        <PanelRight className="size-4" />
      </Button>
    </header>
  );
}
