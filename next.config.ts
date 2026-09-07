import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @resvg/resvg-js (PNG rasterization, docs/TODOS.md 5.8) ships a native
  // .node binary per platform — it must be required at runtime, not bundled.
  serverExternalPackages: ["@resvg/resvg-js"],
  // Self-host/Docker (docs/TODOS.md 5.9): a standalone build copies only the
  // production dependency subset next actually needs into .next/standalone.
  output: "standalone",
  /*
   * `next dev --turbopack` never hits the bug the `webpack` block below
   * fixes — that bug is production-build-only (see its comment) — so there
   * is no Turbopack-side equivalent to add. An empty-ish `turbopack` key
   * would still leave Next's "Webpack is configured while Turbopack is not"
   * warning firing on every `dev` start (its check is presence-of-config,
   * not presence-of-a-problem), so `moduleIds` is set here to its own
   * existing default — a real, valid, no-op turbopack option — purely to
   * tell Next this file's Turbopack story was considered on purpose. `root`
   * would have been the more natural choice (sibling project directories one
   * level up each carry their own lockfile, and normally that risks Next's
   * root inference walking past this project) but the installed Next
   * 15.3.1's runtime schema for `turbopack` doesn't accept it yet.
   */
  turbopack: {
    moduleIds: "named",
  },
  /*
   * Widgets are serialized to SVG with react-dom/server's renderToStaticMarkup
   * (PLAN.md §7 D1). Route handlers are compiled into React's server-component
   * module graph, so webpack resolves with the `react-server` export condition
   * active — and every server subpath in react-dom's exports map is gated on
   * it, pointing at a stub that throws "react-dom/server is not supported in
   * React Server Components". That made every SVG endpoint return 500 in a
   * production build while `next dev` rendered fine.
   *
   * Marking the specifier external emits a real runtime `require` instead, and
   * the running Node process does not set the `react-server` condition, so it
   * resolves to the genuine renderer. `outputFileTracingIncludes` then carries
   * react-dom into the standalone output, since an external is invisible to
   * Next's dependency tracer.
   */
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        { "react-dom/server.edge": "commonjs react-dom/server.edge" },
      ];
    }
    return config;
  },
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/react-dom/**"],
  },
};

export default nextConfig;
