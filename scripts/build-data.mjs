// One-time/maintenance script: regenerates lib/data/*.json from seed.sql and
// saints-data.csv so the site builds statically with no database dependency.
// Run with: node scripts/build-data.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sql = readFileSync(join(root, "seed.sql"), "utf8");
const csv = readFileSync(join(root, "saints-data.csv"), "utf8");

// Slugs merged into canonical records (mirrors MERGED_SAINT_SLUGS in next.config.ts).
const MERGED = new Set([
  "adelaide", "boris", "olga-of-kyiv", "lydwina-of-schiedam", "bernadette",
  "vladimir", "brigid-of-kildare", "colette", "matilda",
  "oscar-arnulfo-romero", "pio-of-pietrelcina",
  "laura-of-saint-catherine-of-siena", "methodius-of-moravia",
  "john-damascene", "columba", "david", "gianna-molla", "teresa-of-vila",
  "teresa-of-calcutta", "th-r-se-of-lisieux",
]);

// --- SQL value-tuple parser -------------------------------------------------
// Parses "(v1, v2, ...)" tuples from an INSERT ... VALUES block, handling
// single-quoted strings with '' escapes.
function parseTuples(block) {
  const tuples = [];
  let i = 0;
  while (i < block.length) {
    if (block[i] !== "(") { i++; continue; }
    // Skip subselects like ((SELECT ...), ...) — handled by depth tracking.
    const values = [];
    let cur = "";
    let depth = 1;
    let inStr = false;
    i++;
    while (i < block.length && depth > 0) {
      const ch = block[i];
      if (inStr) {
        if (ch === "'" && block[i + 1] === "'") { cur += "'"; i += 2; continue; }
        if (ch === "'") { inStr = false; i++; continue; }
        cur += ch; i++; continue;
      }
      if (ch === "'") { inStr = true; cur = cur; i++; values._lastWasString = true; continue; }
      if (ch === "(") { depth++; cur += ch; i++; continue; }
      if (ch === ")") {
        depth--;
        if (depth === 0) { values.push(cur.trim()); i++; break; }
        cur += ch; i++; continue;
      }
      if (ch === "," && depth === 1) { values.push(cur.trim()); cur = ""; i++; continue; }
      cur += ch; i++;
    }
    if (values.length) tuples.push(values);
  }
  return tuples;
}

// Extract each INSERT statement's VALUES payload for a given table.
function insertBlocks(table) {
  const re = new RegExp(
    `INSERT INTO ${table}\\s*\\(([^)]*)\\)\\s*VALUES`,
    "g"
  );
  const blocks = [];
  let m;
  while ((m = re.exec(sql))) {
    const start = re.lastIndex;
    const end = sql.indexOf(";\n", start);
    blocks.push({
      columns: m[1].split(",").map((c) => c.trim()),
      body: sql.slice(start, end === -1 ? sql.length : end + 1),
    });
  }
  return blocks;
}

// String parsing above loses the string/non-string distinction; re-parse with
// a simpler approach: values arrive as raw text with quotes stripped inside
// parseTuples, so numbers stay as "3" strings — coerce below per column.

// --- Saints from seed.sql ---------------------------------------------------
const saintCols = [
  "name", "slug", "tagline", "description", "prayer", "feast_day", "emoji",
  "trait_contemplative", "trait_charitable", "trait_intellectual",
  "trait_courageous", "trait_joyful", "trait_mystical",
];
const saintsRaw = [];
for (const block of insertBlocks("saints")) {
  for (const t of parseTuples(block.body)) {
    if (t.length !== saintCols.length) {
      console.warn(`Skipping malformed saint row (${t.length} cols):`, t[0]);
      continue;
    }
    const rec = {};
    saintCols.forEach((c, idx) => {
      rec[c] = c.startsWith("trait_") ? Number(t[idx]) : t[idx];
    });
    saintsRaw.push(rec);
  }
}

// --- CSV enrichment ---------------------------------------------------------
function parseCsv(text) {
  const rows = [];
  let row = [], cur = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); cur = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cur += ch;
  }
  if (cur !== "" || row.length) { row.push(cur); if (row.some((c) => c.trim() !== "")) rows.push(row); }
  return rows;
}

const csvRows = parseCsv(csv);
const header = csvRows[0];
const idx = Object.fromEntries(header.map((h, i) => [h, i]));
const normalize = (name) =>
  name
    .toLowerCase()
    .replace(/^st\.\s+/, "")
    .replace(/^saint\s+/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const enrichment = new Map();
for (const r of csvRows.slice(1)) {
  const name = r[idx.name];
  if (!name) continue;
  enrichment.set(normalize(name), {
    known_for: r[idx.knownFor] || null,
    patron_of: r[idx.patronOf] || null,
    dates: r[idx.dates] || null,
    origin: r[idx.origin] || null,
    gender: r[idx.gender] || null,
    // Quotes are ";"-separated, but only after sentence-ending punctuation —
    // semicolons inside a quote ("...at all times; when necessary...") stay.
    quotes: (r[idx.quotes] || "")
      .split(/(?<=[.!?"”])\s*;\s+/)
      .map((q) => q.replace(/;\s*$/, "").trim())
      .filter(Boolean),
    fun_fact: r[idx.funFact] || null,
  });
}

// Slugs that were generated with broken accent handling (é → -, ä → -).
// Remapped to clean ASCII transliterations; next.config.ts 301s the old ones.
const SLUG_FIXES = {
  "b-n-zet": "benezet",
  "franz-j-gerst-tter": "franz-jagerstatter",
  "jos-s-nchez-del-r-o": "jose-sanchez-del-rio",
  "josemar-a-escriv": "josemaria-escriva",
  "mar-a-de-jes-s-sacramentado": "maria-de-jesus-sacramentado",
  "mar-a-guadalupe-garc-a-zavala": "maria-guadalupe-garcia-zavala",
  "z-lie-martin": "zelie-martin",
};

// Saints absent from saints-data.csv (modern blesseds/saints added later);
// without a gender they'd be excluded from the quiz's gender-filtered pool.
const GENDER_FIXES = {
  "anne-catherine-emmerich": "Female",
  "carlo-acutis": "Male",
  "chiara-badano": "Female",
  "francisco-marto": "Male",
  "franz-jagerstatter": "Male",
  "imelda-lambertini": "Female",
  "isidore-bakanja": "Male",
  "jacinta-marto": "Female",
  "michael-mcgivney": "Male",
  "pier-giorgio-frassati": "Male",
  "solanus-casey": "Male",
  "stanley-rother": "Male",
  // Present in the CSV but with a blank gender column.
  adrian: "Male",
  afra: "Female",
  egwin: "Male",
  eutychian: "Male",
  frederick: "Male",
  "gelasius-i": "Male",
  martial: "Male",
  medard: "Male",
  pammachius: "Male",
  "romanus-of-condat": "Male",
  sabina: "Female",
  symphorian: "Male",
  trophimus: "Male",
};

// --- Merge, dedupe, finalize -------------------------------------------------
const bySlug = new Map();
let dropped = 0, enriched = 0;
for (const s of saintsRaw) {
  if (MERGED.has(s.slug)) { dropped++; continue; }
  s.slug = SLUG_FIXES[s.slug] ?? s.slug;
  if (bySlug.has(s.slug)) { dropped++; continue; } // keep first (curated) record
  const extra = enrichment.get(normalize(s.name)) ?? null;
  if (extra) enriched++;
  // The CSV import used knownFor as the tagline, so drop known_for when it
  // would just repeat the tagline on the page.
  if (extra && extra.known_for === s.tagline) extra.known_for = null;
  bySlug.set(s.slug, {
    id: s.slug,
    ...s,
    prayer: s.prayer || null,
    feast_day: s.feast_day || null,
    gender: extra?.gender ?? GENDER_FIXES[s.slug] ?? null,
    known_for: extra?.known_for ?? null,
    patron_of: extra?.patron_of ?? null,
    dates: extra?.dates ?? null,
    origin: extra?.origin ?? null,
    quotes: extra?.quotes ?? [],
    fun_fact: extra?.fun_fact ?? null,
  });
}
const saints = [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));

// --- Questions & options from seed.sql ---------------------------------------
const questions = [];
for (const block of insertBlocks("questions")) {
  for (const t of parseTuples(block.body)) {
    if (t.length !== 2) continue;
    questions.push({ id: `q${t[0]}`, sort_order: Number(t[0]), text: t[1] });
  }
}
questions.sort((a, b) => a.sort_order - b.sort_order);

const options = [];
for (const block of insertBlocks("options")) {
  for (const t of parseTuples(block.body)) {
    if (t.length !== 8) continue;
    // First value is "(SELECT id FROM questions WHERE sort_order = N)" — pull N.
    const qMatch = t[0].match(/sort_order\s*=\s*(\d+)/);
    if (!qMatch) continue;
    options.push({
      id: `q${qMatch[1]}-o${options.length}`,
      question_id: `q${qMatch[1]}`,
      label: t[1],
      trait_contemplative: Number(t[2]),
      trait_charitable: Number(t[3]),
      trait_intellectual: Number(t[4]),
      trait_courageous: Number(t[5]),
      trait_joyful: Number(t[6]),
      trait_mystical: Number(t[7]),
    });
  }
}

// --- Write -------------------------------------------------------------------
const outDir = join(root, "lib", "data");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "saints.json"), JSON.stringify(saints, null, 1));
writeFileSync(
  join(outDir, "quiz.json"),
  JSON.stringify({ questions, options }, null, 1)
);
// Slim copy for the client-side quiz bundle: only the fields the quiz and
// result screen render, so the enrichment content doesn't bloat the JS bundle.
const quizSaints = saints.map(
  ({ id, name, slug, tagline, description, prayer, feast_day, gender,
     trait_contemplative, trait_charitable, trait_intellectual,
     trait_courageous, trait_joyful, trait_mystical }) => ({
    id, name, slug, tagline, description, prayer, feast_day, gender,
    trait_contemplative, trait_charitable, trait_intellectual,
    trait_courageous, trait_joyful, trait_mystical,
  })
);
writeFileSync(
  join(outDir, "quiz-saints.json"),
  JSON.stringify(quizSaints, null, 1)
);

console.log(
  `saints: ${saints.length} (dropped ${dropped} merged/duplicate slugs, enriched ${enriched} from CSV)`
);
console.log(`questions: ${questions.length}, options: ${options.length}`);
const missingEnrichment = saints.filter((s) => !s.patron_of).length;
console.log(`saints without CSV enrichment: ${missingEnrichment}`);
