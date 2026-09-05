"use client";

import type { OptionDef } from "@/lib/options";
import { WEEKDAY_ABBREVIATIONS } from "@/widgets/streak/schema";
import type { FormValue } from "./query";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export interface OptionFieldProps {
  name: string;
  def: OptionDef;
  value: FormValue;
  onChange: (value: FormValue) => void;
}

/** Renders a form control for a single declared option, dispatching on its schema type (docs/TODOS.md task 1.8). */
export function OptionField({ name, def, value, onChange }: OptionFieldProps) {
  const label = name.replace(/_/g, " ");

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
