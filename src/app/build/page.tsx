import { Suspense } from "react";
import { BuilderClient } from "./BuilderClient";

export default function BuildPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm opacity-70">Loading builder…</div>}>
      <BuilderClient />
    </Suspense>
  );
}
