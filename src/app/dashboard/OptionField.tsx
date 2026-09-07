"use client";

import type { OptionDef } from "@/lib/options";
import { WEEKDAY_ABBREVIATIONS } from "@/widgets/streak/schema";
import { USER_BADGE_KEYS, REPO_BADGE_KEYS } from "@/lib/badges";
import { LOCALES } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormValue } from "./query";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * A curated shortlist of common simple-icons slugs for the tech-icons widget's
 * `name` field autocomplete — not the full ~3,459-icon catalog, which is both
 * impractical as a `<datalist>` and server-only data we don't want in the
 * client bundle. Free text still accepts any valid slug.
 */
const COMMON_TECH_ICON_SLUGS = [
  "react", "vuedotjs", "angular", "svelte", "nextdotjs", "nuxtdotjs", "typescript", "javascript",
  "python", "go", "rust", "cplusplus", "c", "csharp", "java", "kotlin", "swift", "php", "ruby",
  "nodedotjs", "deno", "bun", "html5", "css3", "tailwindcss", "sass", "webpack", "vite",
  "docker", "kubernetes", "amazonaws", "googlecloud", "microsoftazure", "vercel", "netlify",
  "git", "github", "gitlab", "postgresql", "mysql", "mongodb", "redis", "sqlite", "graphql",
  "django", "flask", "fastapi", "spring", "laravel", "express", "nestjs", "flutter", "dart",
  "androidstudio", "linux", "ubuntu", "nginx", "figma", "jest", "pytorch", "tensorflow",
];

/** Common `date_format` presets — free text still works for anything else. */
const DATE_FORMAT_PRESETS = [
  { value: "M j[, Y]", label: "Jan 5[, 2024] — short, year if not current" },
  { value: "M j, Y", label: "Jan 5, 2024 — always with year" },
  { value: "d/m/Y", label: "05/01/2024 — day/month/year" },
  { value: "m/d/Y", label: "01/05/2024 — month/day/year" },
  { value: "F j, Y", label: "January 5, 2024 — full month" },
  { value: "Y-m-d", label: "2024-01-05 — ISO-like" },
];

export interface OptionFieldProps {
  name: string;
  def: OptionDef;
  value: FormValue;
  onChange: (value: FormValue) => void;
  /** Disambiguates same-named fields across widgets (e.g. `name` on badges vs tech-icons). */
  widgetType?: string;
}

export function OptionField({ name, def, value, onChange, widgetType }: OptionFieldProps) {
  const label = name.replace(/_/g, " ");

  if (name === "name" && widgetType === "badges") {
    const selected = new Set(Array.isArray(value) ? value : []);
    const toggle = (key: string) => {
      const next = new Set(selected);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onChange(Array.from(next));
    };
    return (
      <Field label="Badges" description={def.description}>
        <p className="text-[11px] text-muted-foreground mb-1.5">User badges</p>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {USER_BADGE_KEYS.map((key) => (
            <Chip key={key} label={key} active={selected.has(key)} onClick={() => toggle(key)} />
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mb-1.5">
          Repo badges <span className="opacity-70">(need a `repo`)</span>
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {REPO_BADGE_KEYS.map((key) => (
            <Chip key={key} label={key} active={selected.has(key)} onClick={() => toggle(key)} />
          ))}
        </div>
      </Field>
    );
  }

  if (name === "locale") {
    return (
      <Field label={label} description={def.description}>
        <Select value={typeof value === "string" ? value : "en"} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCALES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.label} ({l.code}){l.rtl ? " · RTL" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    );
  }

  if (name === "date_format") {
    const stringValue = typeof value === "string" ? value : ((def.default as string) ?? "");
    const matchesPreset = DATE_FORMAT_PRESETS.some((p) => p.value === stringValue);
    return (
      <Field label={label} description={def.description}>
        <Select value={matchesPreset ? stringValue : "__custom"} onValueChange={(v) => v !== "__custom" && onChange(v)}>
          <SelectTrigger className="w-full mb-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_FORMAT_PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
            <SelectItem value="__custom">Custom pattern…</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="d j F M m n Y y tokens; [...] shows only if the year differs"
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
    );
  }

  if (name === "name" && widgetType === "tech-icons") {
    return (
      <Field label="Icon slugs" description={def.description}>
        <Input
          list="tech-icon-slugs"
          placeholder="react,typescript,nodedotjs"
          value={Array.isArray(value) ? value.join(",") : ""}
          onChange={(e) => onChange(splitList(e.target.value))}
        />
        <datalist id="tech-icon-slugs">
          {COMMON_TECH_ICON_SLUGS.map((slug) => (
            <option key={slug} value={slug} />
          ))}
        </datalist>
      </Field>
    );
  }

  if (name === "exclude_days") {
    const selected = new Set(Array.isArray(value) ? value : []);
    return (
      <Field label={label} description={def.description}>
        <div className="flex gap-1.5 flex-wrap">
          {WEEKDAY_ABBREVIATIONS.map((day) => {
            const active = selected.has(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={active}
                title={`A missed ${day} does not break the streak`}
                onClick={() => {
                  const next = new Set(selected);
                  if (active) next.delete(day);
                  else next.add(day);
                  onChange(Array.from(next));
                }}
                className={cn(
                  // 44px min touch target below lg (docs/TODOS.md 12.37).
                  "size-11 lg:size-9 rounded-md border text-xs font-medium transition-colors",
                  active
                    ? "bg-brand text-white border-brand"
                    : "bg-transparent hover:bg-accent text-muted-foreground"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </Field>
    );
  }

  switch (def.type) {
    case "boolean":
      return (
        <div className="flex items-center justify-between gap-3 py-2 min-h-11 lg:min-h-0">
          <span className="text-sm capitalize flex items-center gap-1.5">
            {label}
            <Hint text={def.description} />
          </span>
          <Switch
            checked={typeof value === "boolean" ? value : false}
            onCheckedChange={(checked) => onChange(checked)}
          />
        </div>
      );

    case "enum":
      return (
        <Field label={label} description={def.description}>
          <Select
            value={typeof value === "string" ? value : ((def.default as string) ?? "")}
            onValueChange={onChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {def.values.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      );

    case "number": {
      const numeric = Number(value ?? def.default ?? 0);
      const current = Number.isFinite(numeric) ? numeric : Number(def.default ?? 0);
      // A slider is only meaningful over a bounded, reasonably small range;
      // wide-open numbers (cache_seconds, starting_year) stay a text input.
      const sliderable =
        def.min !== undefined && def.max !== undefined && def.max - def.min <= 2000;
      return (
        <Field label={label} description={def.description}>
          {sliderable ? (
            <div className="flex items-center gap-3">
              <Slider
                className="flex-1"
                min={def.min}
                max={def.max}
                step={1}
                value={[current]}
                onValueChange={([v]) => onChange(String(v))}
              />
              <Input
                type="number"
                className="w-20 shrink-0 tabular-nums"
                min={def.min}
                max={def.max}
                value={String(current)}
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
          ) : (
            <Input
              type="number"
              min={def.min}
              max={def.max}
              value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
              placeholder={def.default !== undefined ? String(def.default) : undefined}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </Field>
      );
    }

    case "color": {
      const stringValue = typeof value === "string" ? value : "";
      const hexForPicker = HEX_COLOR_RE.test(`#${stringValue}`) ? `#${stringValue}` : "#000000";
      return (
        <Field label={label} description={def.description}>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label={`${label} colour picker`}
              className="size-11 lg:size-9 shrink-0 rounded-md border bg-transparent cursor-pointer p-0.5"
              value={hexForPicker}
              onChange={(e) => onChange(e.target.value.replace(/^#/, ""))}
            />
            <Input
              className="flex-1 font-mono text-xs"
              placeholder="hex, colour name, or angle,c1,c2"
              value={stringValue}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </Field>
      );
    }

    case "commaList":
      return (
        <Field label={label} description={def.description}>
          <Input
            value={Array.isArray(value) ? value.join(",") : ""}
            placeholder="comma,separated,values"
            onChange={(e) => onChange(splitList(e.target.value))}
          />
        </Field>
      );

    case "string":
    default:
      return (
        <Field label={label} description={def.description}>
          <Input
            value={typeof value === "string" ? value : ""}
            placeholder={def.default !== undefined ? String(def.default) : undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
  }
}

function splitList(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-1.5">
      <Label className="text-xs capitalize mb-1.5 flex items-center gap-1.5 text-muted-foreground">
        {label}
        <Hint text={description} />
      </Label>
      {children}
    </div>
  );
}

/** Option descriptions come from the schema; showing them all inline would bury the controls. */
function Hint({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" tabIndex={-1} className="text-muted-foreground/60 hover:text-foreground">
          <Info className="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{text}</TooltipContent>
    </Tooltip>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-2.5 py-2 lg:py-1 rounded-md text-xs font-medium border transition-colors",
        active ? "bg-brand text-white border-brand" : "hover:bg-accent text-muted-foreground"
      )}
    >
      {label}
    </button>
  );
}
