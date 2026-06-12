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
};

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      ...Object.entries(MERGED_SAINT_SLUGS).map(([from, to]) => ({
        source: `/saints/${from}`,
        destination: `/saints/${to}`,
        permanent: true,
      })),
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
