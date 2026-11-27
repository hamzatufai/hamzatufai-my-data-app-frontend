/**
 * Strong API connection strategy:
 * 1. Same-origin proxy — when API_PROXY_TARGET (or NEXT_PUBLIC_API_URL fallback)
 *    is set at build/deploy time, all browser calls to /api/* are proxied by the
 *    Next.js server to the backend. Browsers then never make a cross-origin
 *    call: no CORS preflights, no mixed-origin cookies.
 * 2. Direct cross-origin fallback — if no proxy target is configured, the
 *    client falls back to the backend base URL (NEXT_PUBLIC_API_URL) directly,
 *    with CORS handled by the backend and retries in lib/api.ts.
 */
const BACKEND_URL =
  process.env.API_PROXY_TARGET ?? process.env.NEXT_PUBLIC_API_URL ?? "";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Prevent Turbopack from inferring a workspace root above this standalone app.
  turbopack: { root: process.cwd() },
  ...(BACKEND_URL && /^https?:\/\//.test(BACKEND_URL)
    ? {
        async rewrites() {
          return [
            { source: "/api/:path*", destination: `${BACKEND_URL.replace(/\/+$/, "")}/api/:path*` },
          ];
        },
      }
    : {}),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
