import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      // Legacy URLs from the pre-Next.js static site, still indexed by Google.
      {
        source: "/all-saints.html",
        destination: "/resources",
        permanent: true,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      // Apex → www, permanent. Vercel's domain-level redirect is a 307;
      // a 308 here tells Google the www host is canonical for good.
      {
        source: "/:path*",
        has: [{ type: "host", value: "saintdiscoveryquiz.com" }],
        destination: "https://www.saintdiscoveryquiz.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
