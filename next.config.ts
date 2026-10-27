import type { NextConfig } from "next";

// Duplicate saint slugs that were merged into a canonical record.
// Each removed slug 301s to the saint that was kept so old links and
// search-indexed URLs pass their authority to the survivor.
const MERGED_SAINT_SLUGS: Record<string, string> = {
  adelaide: "adelaide-of-italy",
  boris: "boris-of-bulgaria",
  "olga-of-kyiv": "olga-of-kiev",
  "lydwina-of-schiedam": "lidwina-of-schiedam",
  bernadette: "bernadette-soubirous",
  vladimir: "vladimir-of-kiev",
  "brigid-of-kildare": "brigid-of-ireland",
  colette: "colette-of-corbie",
  matilda: "matilda-of-ringelheim",
  "oscar-arnulfo-romero": "oscar-romero",
  "pio-of-pietrelcina": "padre-pio",
  "laura-of-saint-catherine-of-siena": "laura-montoya",
  "methodius-of-moravia": "cyril-and-methodius",
  "john-damascene": "john-of-damascus",
  columba: "columba-of-iona",
  david: "david-of-wales",
  "gianna-molla": "gianna-beretta-molla",
  "teresa-of-vila": "teresa-of-avila",
  "teresa-of-calcutta": "mother-teresa",
  "th-r-se-of-lisieux": "therese-of-lisieux",
  // Slugs regenerated with proper accent transliteration (é → e, ä → a).
  "b-n-zet": "benezet",
  "franz-j-gerst-tter": "franz-jagerstatter",
  "jos-s-nchez-del-r-o": "jose-sanchez-del-rio",
  "josemar-a-escriv": "josemaria-escriva",
  "mar-a-de-jes-s-sacramentado": "maria-de-jesus-sacramentado",
  "mar-a-guadalupe-garc-a-zavala": "maria-guadalupe-garcia-zavala",
  "z-lie-martin": "zelie-martin",
};

const nextConfig: NextConfig = {
  // Allow an isolated local build when a Windows sync service locks .next.
  distDir: process.env.SAINT_BUILD_DIR || ".next",
  images: {
    // Raster artwork uses pre-generated srcsets; icons and unknown sources
    // must never invoke the metered runtime optimizer as a fallback.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/wikipedia/commons/**" },
      // Commons image metadata also returns thumbnails from this dedicated host.
      { protocol: "https", hostname: "thumb.wikimedia.org", port: "", pathname: "/wikipedia/commons/thumb/**" },
    ],
  },
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      { source: "/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ] },
      { source: "/images/responsive/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
  async redirects() {
    return [
      ...Object.entries(MERGED_SAINT_SLUGS).map(([from, to]) => ({
        source: `/saints/${from}`,
        destination: `/saints/${to}`,
        permanent: true,
      })),
      { source: "/saints", destination: "/resources", permanent: true },
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
