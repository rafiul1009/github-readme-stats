import { Suspense } from "react";
import { ProfileBuilderClient } from "./ProfileBuilderClient";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm opacity-70">Loading profile builder…</div>}>
      <ProfileBuilderClient />
    </Suspense>
  );
}
