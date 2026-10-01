import type { RecommendationPost } from "./blog-recommendations";

// Match specific subjects rather than promoting arbitrary recent articles.
const subjects = [
  /\b(?:prayer|pray|praying|lectio|examen|novena|rosary)\b/,
  /\b(?:bible|scripture|gospels?|biblical|tradition)\b/,
  /\b(?:eucharist|eucharistic|sacraments?|adoration|communion)\b/,
  /\b(?:confirmation|sponsor|saint report|choosing a saint)\b/,
  /\b(?:mercy|confession|reconciliation|suffering|forgiveness)\b/,
  /\b(?:camino|pilgrimage|pilgrim)\b/,
  /\b(?:ecumenism|ecumenical|councils?)\b/,
];
const stop = new Set("a an the why what how when who for to of in and is are do does can your with catholic catholics church faith guide explained meaning about".split(" "));
const words = (text: string) => new Set((text.toLowerCase().match(/[a-z]+/g) ?? []).filter(word => word.length > 3 && !stop.has(word)));

export function relatedArticles(current: Pick<RecommendationPost, "slug" | "title" | "excerpt">, catalog: RecommendationPost[], now = Date.now()): RecommendationPost[] {
  const context = `${current.title} ${current.excerpt}`.toLowerCase();
  const terms = words(current.title);
  const seen = new Set([current.slug]);
  return catalog.flatMap(post => {
    if (!post || typeof post.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || post.slug.length > 100 || seen.has(post.slug) || typeof post.title !== "string" || !post.title.trim() || typeof post.excerpt !== "string"
      || !Number.isFinite(Date.parse(post.publishedAt)) || Date.parse(post.publishedAt) > now) return [];
    seen.add(post.slug);
    const candidate = `${post.title} ${post.excerpt}`.toLowerCase();
    const shared = [...words(post.title)].filter(term => terms.has(term)).length;
    const topical = subjects.filter(subject => subject.test(context) && subject.test(candidate)).length;
    return topical || shared >= 2 ? [{ post, score: topical * 5 + shared }] : [];
  }).sort((a, b) => b.score - a.score || a.post.slug.localeCompare(b.post.slug)).slice(0, 3).map(entry => entry.post);
}
