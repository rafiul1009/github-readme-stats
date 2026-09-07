"use client";

import { RotateCcw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboard } from "./context";
import { OptionField } from "./OptionField";
import { fieldValue } from "./query";
import { groupOptions, OPTION_GROUP_LABELS, OPTION_GROUP_ORDER } from "./optionGroups";

const IDENTIFYING_FIELD_UI: Record<string, { label: string; placeholder: string }> = {
  username: { label: "GitHub username", placeholder: "octocat" },
  repo: { label: "Repository", placeholder: "owner/name" },
  id: { label: "Gist ID", placeholder: "1345eef09799d4e6ac4c9cce08805875" },
  name: { label: "Names", placeholder: "react,typescript,nodedotjs" },
  lines: { label: "Lines", placeholder: "Hi, I'm Octocat,I build things" },
  user_id: { label: "Stack Overflow user ID", placeholder: "1" },
  package: { label: "npm package", placeholder: "react" },
};

export function OptionsPanel() {
  const { state, dispatch, entry, schema } = useDashboard();
  const identifyingField = entry.identifyingField;
  const identifyingUi = identifyingField
    ? (IDENTIFYING_FIELD_UI[identifyingField] ?? { label: identifyingField, placeholder: "" })
    : undefined;
  const groups = groupOptions(schema, identifyingField);

  return (
    <div className="flex flex-col gap-4">
      {identifyingField && identifyingUi && (
        <div>
          <Label htmlFor="identifying-field" className="text-xs font-medium mb-1.5 text-muted-foreground">
            {identifyingUi.label}
          </Label>
          <Input
            id="identifying-field"
            placeholder={identifyingUi.placeholder}
            value={typeof state.form[identifyingField] === "string" ? (state.form[identifyingField] as string) : ""}
            onChange={(e) => dispatch({ type: "setField", name: identifyingField, value: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Filled in: Generate fetches your real data. Empty: Generate shows a sample card instead.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground truncate">
          {entry.label} options
        </span>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => dispatch({ type: "clearOptions" })}>
          <RotateCcw className="size-3" />
          Reset
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["content"]} className="w-full">
        {OPTION_GROUP_ORDER.filter((key) => groups[key].length > 0).map((key) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger className="py-3 text-sm">
              <span className="flex items-center gap-2">
                {OPTION_GROUP_LABELS[key].title}
                <span className="text-[10px] font-normal text-muted-foreground tabular-nums">
                  {groups[key].length}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-[11px] text-muted-foreground mb-2">{OPTION_GROUP_LABELS[key].hint}</p>
              <div className="flex flex-col divide-y divide-border/50">
                {groups[key].map((name) => (
                  <OptionField
                    key={name}
                    name={name}
                    def={schema[name]}
                    value={fieldValue(schema, state.form, name)}
                    onChange={(value) => dispatch({ type: "setField", name, value })}
                    widgetType={entry.type}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
