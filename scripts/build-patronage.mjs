// Builds lib/data/patronage.json from the patron_of strings in saints.json.
// Run after editing saint data: node scripts/build-patronage.mjs
//
// Output shape:
//   {
//     topics:  [{ slug, label, saints: [saintSlug, ...] }, ...]   (alphabetical)
//     bySaint: { saintSlug: [{ slug, label }, ...] }
//   }
// Topic pages live at /patron-saint-of/[slug]; bySaint drives the links on
// each saint page, so both sides of the mesh come from this one file.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const saints = JSON.parse(
  readFileSync(path.join(root, "lib/data/saints.json"), "utf8")
);

// Spelling/phrasing variants that should share one page. Keys and values are
// canonical-form (lowercased, trimmed) topic strings.
const ALIASES = new Map([
  ["sick people", "the sick"],
  ["sick", "the sick"],
  ["the sick and ill", "the sick"],
  ["ill people", "the sick"],
  ["poor people", "the poor"],
  ["poor", "the poor"],
  ["travellers", "travelers"],
  ["travelers and travellers", "travelers"],
  ["students and scholars", "students"],
  ["mothers-to-be", "expectant mothers"],
  ["pregnant mothers", "expectant mothers"],
  ["the dying", "dying people"],
]);

// Raw fragments that don't work as standalone topic pages.
const JUNK = [
  /^often /,
  /^sometimes /,
  /^considered /,
  /^known /,
  /^etc\b/,
  /^and$/,
  /^of /,
  /^the state of/,
  /protector of the church/,
];

function cleanTopic(raw) {
  let t = raw
    .trim()
    .replace(/\([^)]*\)/g, " ") // parentheticals: "Americas (Orthodox)"
    .replace(/\.+$/, "") // trailing periods: "those in danger."
    .replace(/^and\s+/i, "") // leading "and": "..., and the unloved"
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return null;
  const key = t.toLowerCase();
  if (key.length < 3 || key.length > 40) return null;
  if (key.split(" ").length > 4) return null;
  if (JUNK.some((re) => re.test(key))) return null;
  return t;
}

// canonical key -> { label, saints: Set }
const topics = new Map();
// saint slug -> [{ key }]
const bySaintKeys = new Map();

for (const saint of saints) {
  if (!saint.slug || !saint.patron_of) continue;
  const seen = new Set();
  for (const fragment of saint.patron_of.split(/[,;]/)) {
    const cleaned = cleanTopic(fragment);
    if (!cleaned) continue;
    let key = cleaned.toLowerCase();
    key = ALIASES.get(key) ?? key;
    if (seen.has(key)) continue;
    seen.add(key);

    let entry = topics.get(key);
    if (!entry) {
      entry = { labels: new Map(), saints: new Set() };
      topics.set(key, entry);
    }
    // Track label casing variants; the most frequent one wins so proper
    // nouns (England, Vietnamese mothers) keep their capitalization.
    const label = ALIASES.has(cleaned.toLowerCase()) ? key : cleaned;
    entry.labels.set(label, (entry.labels.get(label) ?? 0) + 1);
    entry.saints.add(saint.slug);

    if (!bySaintKeys.has(saint.slug)) bySaintKeys.set(saint.slug, []);
    bySaintKeys.get(saint.slug).push(key);
  }
}

function slugify(key) {
  return key
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const topicList = [];
const slugByKey = new Map();
const usedSlugs = new Set();

for (const [key, entry] of topics) {
  const slug = slugify(key);
  if (!slug || usedSlugs.has(slug)) continue; // drop unslugifiable/colliding
  usedSlugs.add(slug);
  slugByKey.set(key, slug);
  const label = [...entry.labels.entries()].sort((a, b) => b[1] - a[1])[0][0];
  topicList.push({ slug, label, saints: [...entry.saints].sort() });
}

topicList.sort((a, b) => a.slug.localeCompare(b.slug));

const bySaint = {};
for (const [saintSlug, keys] of bySaintKeys) {
  const links = keys
    .filter((key) => slugByKey.has(key))
    .map((key) => {
      const slug = slugByKey.get(key);
      const topic = topicList.find((t) => t.slug === slug);
      return { slug, label: topic.label };
    });
  if (links.length > 0) bySaint[saintSlug] = links;
}

const out = { topics: topicList, bySaint };
writeFileSync(
  path.join(root, "lib/data/patronage.json"),
  JSON.stringify(out, null, 2) + "\n"
);

const single = topicList.filter((t) => t.saints.length === 1).length;
console.log(
  `patronage.json: ${topicList.length} topics (${single} single-saint), ` +
    `${Object.keys(bySaint).length} saints linked`
);
