import type { Saint } from "./types";

export interface RecommendationPost {
  slug: string; title: string; excerpt: string; category: string; publishedAt: string;
}
export interface BlogRecommendation extends RecommendationPost { reason: string }
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const contains = (text: string, phrase: string) => (` ${text} `).includes(` ${normalize(phrase)} `);
const topics = [
  { words: ["eucharist", "eucharistic", "adoration"], label: "Explore Eucharistic faith" },
  { words: ["mercy", "confession", "reconciliation", "repentance"], label: "Explore mercy and reconciliation" },
  { words: ["suffering", "illness", "sick", "hospital"], label: "Faith in difficult times" },
  { words: ["scripture", "bible", "biblical", "gospel", "gospels"], label: "Go deeper into Scripture" },
  { words: ["missionary", "missionaries", "evangelization", "preaching"], label: "Sharing the faith" },
  { words: ["prayer", "contemplation", "contemplative", "monastic", "monk"], label: "Bring reflection into prayer" },
  { words: ["pilgrimage", "pilgrim", "pilgrims", "camino"], label: "Explore the pilgrim journey" },
  { words: ["rosary", "marian"], label: "Explore Marian prayer" },
];
// Editorial connections supplement saints whose names have several forms.
const connections: Record<string, string[]> = {
  "faustina-kowalska": ["what-is-divine-mercy-chaplet-sunday"],
  "james-the-greater": ["walking-camino-de-santiago-catholic-guide"],
  "michael-the-archangel": ["michael-gabriel-raphael-archangels-feast"],
  "gabriel-the-archangel": ["michael-gabriel-raphael-archangels-feast"],
  "raphael-the-archangel": ["michael-gabriel-raphael-archangels-feast"],
};
const foundations = ["why-do-catholics-pray-to-saints", "how-to-celebrate-patron-saint-feast-day", "how-to-write-confirmation-saint-report"];

// Uses publication summaries, never drafts, article bodies or visitor profiles.
export function recommendBlogPosts(saint: Pick<Saint, "slug" | "name" | "description" | "known_for" | "patron_of" | "kind">, posts: RecommendationPost[], now = Date.now()): BlogRecommendation[] {
  if (saint.kind === "unresolved" || saint.kind === "observance") return [];
  const context = normalize([saint.description, saint.known_for, saint.patron_of].filter(Boolean).join(" "));
  const names = [normalize(saint.slug), normalize(saint.name).replace(/^(st|saint|blessed) /, "")].filter(name => name.length > 3);
  const seen = new Set<string>();
  return posts.flatMap(post => {
    if (!post || typeof post.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || post.slug.length > 100 || seen.has(post.slug)
      || typeof post.title !== "string" || !post.title.trim() || typeof post.excerpt !== "string" || typeof post.category !== "string"
      || !Number.isFinite(Date.parse(post.publishedAt)) || Date.parse(post.publishedAt) > now) return [];
    seen.add(post.slug);
    const text = normalize(`${post.title} ${post.excerpt}`);
    let score = 0, reason = "A next step with your saint";
    if (names.some(name => contains(text, name)) || connections[saint.slug]?.includes(post.slug)) { score = 100; reason = "Connected to this saint"; }
    for (const topic of topics) {
      if (topic.words.some(word => contains(context, word)) && topic.words.some(word => contains(text, word))) {
        if (!score) reason = topic.label;
        score += 10;
      }
    }
    const foundation = foundations.indexOf(post.slug);
    if (!score && foundation !== -1) score = 3 - foundation;
    return score ? [{ ...post, reason, score }] : [];
  }).sort((a, b) => b.score - a.score || b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug))
    .slice(0, 2).map(({ slug, title, excerpt, category, publishedAt, reason }) => ({ slug, title, excerpt, category, publishedAt, reason }));
}
