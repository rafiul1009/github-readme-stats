import { Suspense } from "react";
import { Dashboard } from "./dashboard/Dashboard";

/**
 * Everything lives here (PLAN.md §9): widget building, README composition,
 * themes, and the gallery are regions of one dashboard, not separate routes.
 * `/build`, `/profile`, `/gallery` and `/themes` redirect in.
 */
export default function Home() {
  return (
    <Suspense fallback={<div className="h-dvh" />}>
      <Dashboard />
    </Suspense>
  );
}
