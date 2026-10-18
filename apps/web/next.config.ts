import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker multi-stage build (runner stage copies .next/standalone)
  output: "standalone",

  // Explicitly prevent leaking frontend TypeScript source maps in production builds
  productionBrowserSourceMaps: false,

  // ── Security Headers ────────────────────────────────────────────────────────
  // Applied to every response from the Next.js server.
  // Verify at: https://securityheaders.com after deployment.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Block this app from being embedded in an <iframe> (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Stop browsers from guessing file MIME types (MIME sniffing attacks)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only send the origin (not full URL) in Referer headers to 3rd parties
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS for 2 years, including subdomains (only active in prod)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Disable browser features we don't use
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Content-Security-Policy (report-only — tune before switching to enforcing)
          // This logs violations without breaking anything. Once clean, remove
          // "Report-Only" from the key and tighten the policy.
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // tighten after audit
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' wss: https:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source:
          "/dashboard/:role(admin|business-manager|closing-manager|director|finance|post-sales|post-sales-manager|pre-sales|pre-sales-manager|sales-executive|sales-manager|sourcing-manager)/:channel(email|sms|whatsapp)",
        destination: "/dashboard/inbox/:channel",
        permanent: false,
      },
      {
        source:
          "/dashboard/:role(admin|business-manager|closing-manager|director|finance|post-sales|post-sales-manager|pre-sales|pre-sales-manager|sales-executive|sales-manager|sourcing-manager)/:channel(email|sms|whatsapp)/inbox",
        destination: "/dashboard/inbox/:channel",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/telephony/:path*",
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:3333"}/api/crm/telephony/:path*`,
      },
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:3333"}/:path*`, // Proxy to Backend
      },
      {
        source: "/api/marketing/:path*",
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:3333"}/api/marketing/:path*`, // Direct Marketing API Proxy
      },
      {
        source: "/api/crm/:path*",
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:3333"}/api/crm/:path*`, // Direct CRM API Proxy
      },
    ];
  },
};

export default nextConfig;

