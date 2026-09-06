"use client";

import type { OptionDef } from "@/lib/options";
import { WEEKDAY_ABBREVIATIONS } from "@/widgets/streak/schema";
import { USER_BADGE_KEYS, REPO_BADGE_KEYS } from "@/lib/badges";
import { LOCALES } from "@/lib/i18n";
import type { FormValue } from "./query";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * A curated shortlist of common simple-icons slugs for the tech-icons
 * widget's `name` field autocomplete (docs/TODOS.md 8.8) — not the full
 * ~3,459-icon catalog, which is both impractical as a `<datalist>` and
 * server-only data we don't want in the client bundle. Free text still
 * accepts any valid slug; see https://simpleicons.org for the full list.
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

/** Common `date_format` presets (task 5.4) — free text still works for anything else. */
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
  /** Disambiguates same-named fields across widgets (e.g. "name" means badge types for `badges`, icon slugs for `tech-icons`). */
  widgetType?: string;
}

/** Renders a form control for a single declared option, dispatching on its schema type (docs/TODOS.md task 1.8). */
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
        <div className="text-xs font-semibold opacity-70 mb-1">User badges</div>
        <div className="flex gap-1 flex-wrap mb-2">
          {USER_BADGE_KEYS.map((key) => (
            <BadgeToggle key={key} label={key} active={selected.has(key)} onClick={() => toggle(key)} />
          ))}
        </div>
        <div className="text-xs font-semibold opacity-70 mb-1">Repo badges (need `repo`)</div>
        <div className="flex gap-1 flex-wrap">
          {REPO_BADGE_KEYS.map((key) => (
            <BadgeToggle key={key} label={key} active={selected.has(key)} onClick={() => toggle(key)} />
          ))}
        </div>
      </Field>
    );
  }

  if (name === "locale") {
    const stringValue = typeof value === "string" ? value : "en";
    return (
      <Field label={label} description={def.description}>
        <select
          className="border rounded px-2 py-1 text-sm w-full bg-transparent"
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label} ({l.code}){l.rtl ? " · RTL" : ""}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  if (name === "date_format") {
    const stringValue = typeof value === "string" ? value : (def.default as string) ?? "";
    const matchesPreset = DATE_FORMAT_PRESETS.some((p) => p.value === stringValue);
    return (
      <Field label={label} description={def.description}>
        <select
          className="border rounded px-2 py-1 text-sm w-full bg-transparent mb-1"
          value={matchesPreset ? stringValue : "custom"}
          onChange={(e) => {
            if (e.target.value !== "custom") onChange(e.target.value);
          }}
        >
          {DATE_FORMAT_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
          <option value="custom">Custom pattern…</option>
        </select>
        <input
          type="text"
          className="border rounded px-2 py-1 text-sm w-full bg-transparent"
          placeholder="d/j/F/M/m/n/Y/y tokens, [...] shown only if year differs"
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
    );
  }

  if (name === "name" && widgetType === "tech-icons") {
    const stringValue = Array.isArray(value) ? value.join(",") : "";
    return (
      <Field label="Icon slugs" description={def.description}>
        <input
          type="text"
          list="tech-icon-slugs"
          className="border rounded px-2 py-1 text-sm w-full bg-transparent"
          placeholder="react,typescript,nodedotjs"
          value={stringValue}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
            )
          }
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
        <div className="flex gap-1 flex-wrap">
          {WEEKDAY_ABBREVIATIONS.map((day) => {
            const active = selected.has(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const next = new Set(selected);
                  if (active) next.delete(day);
                  else next.add(day);
                  onChange(Array.from(next));
                }}
                className={`w-9 h-9 rounded text-xs font-medium border transition-colors ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-transparent border-neutral-400 dark:border-neutral-600"
                }`}
                title={`Exclude ${day}`}
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
        <label className="flex items-center gap-2 py-1 cursor-pointer" title={def.description}>
          <input
            type="checkbox"
            checked={typeof value === "boolean" ? value : false}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-sm capitalize">{label}</span>
        </label>
      );

    case "enum":
      return (
        <Field label={label} description={def.description}>
          <select
            className="border rounded px-2 py-1 text-sm w-full bg-transparent"
            value={typeof value === "string" ? value : (def.default as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          >
            {def.values.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>
      );

    case "number":
      return (
        <Field label={label} description={def.description}>
          <input
            type="number"
            className="border rounded px-2 py-1 text-sm w-full bg-transparent"
            min={def.min}
            max={def.max}
            value={typeof value === "string" || typeof value === "number" ? value : ""}
            placeholder={def.default !== undefined ? String(def.default) : undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "color": {
      const stringValue = typeof value === "string" ? value : "";
      const hexForPicker = HEX_COLOR_RE.test(`#${stringValue}`) ? `#${stringValue}` : "#000000";
      return (
        <Field label={label} description={def.description}>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-8 h-8 border rounded cursor-pointer bg-transparent"
              value={hexForPicker}
              onChange={(e) => onChange(e.target.value.replace(/^#/, ""))}
            />
            <input
              type="text"
              className="border rounded px-2 py-1 text-sm flex-1 bg-transparent"
              placeholder="hex, name, or angle,c1,c2"
              value={stringValue}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </Field>
      );
    }

    case "commaList": {
      const stringValue = Array.isArray(value) ? value.join(",") : "";
      return (
        <Field label={label} description={def.description}>
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm w-full bg-transparent"
            value={stringValue}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean)
              )
            }
          />
        </Field>
      );
    }

    case "string":
    default:
      return (
        <Field label={label} description={def.description}>
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm w-full bg-transparent"
            value={typeof value === "string" ? value : ""}
            placeholder={def.default !== undefined ? String(def.default) : undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
  }
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
    <label className="block py-1" title={description}>
      <span className="block text-xs font-medium capitalize mb-1 opacity-80">{label}</span>
      {children}
    </label>
  );
}

function BadgeToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
        active ? "bg-blue-600 text-white border-blue-600" : "bg-transparent border-neutral-400 dark:border-neutral-600"
      }`}
    >
      {label}
    </button>
  );
}
