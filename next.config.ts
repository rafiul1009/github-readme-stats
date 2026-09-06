import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @resvg/resvg-js (PNG rasterization, docs/TODOS.md 5.8) ships a native
  // .node binary per platform — it must be required at runtime, not bundled.
  serverExternalPackages: ["@resvg/resvg-js"],
  // Self-host/Docker (docs/TODOS.md 5.9): a standalone build copies only the
  // production dependency subset next actually needs into .next/standalone.
  output: "standalone",
};

export default nextConfig;
