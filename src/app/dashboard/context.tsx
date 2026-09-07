"use client";

import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import { getWidgetCatalogEntry } from "@/widgets/catalog";
import { WIDGET_CATALOG } from "@/widgets/catalog";
import type { OptionSchema } from "@/lib/options";
import {
  dashboardReducer,
  initialState,
  type DashboardAction,
  type DashboardState,
} from "./state";
import type { FormState } from "./query";

interface DashboardContextValue {
  state: DashboardState;
  dispatch: Dispatch<DashboardAction>;
  /** The selected widget's catalog entry, never undefined (falls back to the first). */
  entry: (typeof WIDGET_CATALOG)[number];
  schema: OptionSchema;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ initial, children }: { initial?: Partial<DashboardState>; children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initial, (partial) => ({
    ...initialState(),
    ...partial,
  }));

  const value = useMemo<DashboardContextValue>(() => {
    const entry = getWidgetCatalogEntry(state.widgetType) ?? WIDGET_CATALOG[0];
    return { state, dispatch, entry, schema: entry.schema };
  }, [state]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}

/** Convenience for the many controls that only need to read/write one option. */
export function useFormState(): FormState {
  return useDashboard().state.form;
}
