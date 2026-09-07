"use client";

import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDashboard } from "../context";
import { PROFILE_TEMPLATES } from "./templates";

/**
 * Starter templates as a right-sidebar tab (docs/TODOS.md 12.21). Applying one
 * keeps whatever username and display name are already entered — those are the
 * two things a template can never guess.
 */
export function TemplatesPanel() {
  const { state, dispatch } = useDashboard();

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] text-muted-foreground mb-1">
        Applying a template replaces the widgets, socials, and tech stack. Your username and name are kept.
      </p>
      {PROFILE_TEMPLATES.map((template) => (
        <div key={template.key} className="rounded-lg border p-3">
          <p className="text-sm font-medium mb-0.5">{template.label}</p>
          <p className="text-[11px] text-muted-foreground mb-2">{template.description}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              dispatch({
                type: "setProfile",
                profile: {
                  ...template.build(),
                  username: state.profile.username,
                  name: state.profile.name,
                },
              });
              toast.success(`Applied the ${template.label} template`);
            }}
          >
            <Sparkles className="size-3.5" />
            Use {template.label}
          </Button>
        </div>
      ))}
    </div>
  );
}
