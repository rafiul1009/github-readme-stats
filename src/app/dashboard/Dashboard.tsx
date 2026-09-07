"use client";

import { useSearchParams } from "next/navigation";
import { DashboardProvider } from "./context";
import { Shell } from "./Shell";
import { stateFromSearchParams } from "./permalink";

/** Client entry point for the dashboard at `/` (docs/TODOS.md 12.4). */
export function Dashboard() {
  const searchParams = useSearchParams();
  // Read once: the provider seeds its reducer from this and owns the state
  // afterwards, so later URL writes (which the dashboard itself makes) must
  // not feed back in and clobber what the user is doing.
  const initial = stateFromSearchParams(new URLSearchParams(searchParams.toString()));

  return (
    <DashboardProvider initial={initial}>
      <Shell />
    </DashboardProvider>
  );
}
