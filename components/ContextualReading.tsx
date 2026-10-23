import { ArticleCard } from "./BlogRecommendations";
import catalog from "@/lib/data/blog-artwork-catalog.json";

const paths = {
  home: {
    heading: "Bring your discovery into everyday faith",
    introduction: "Understand why Catholics ask the saints to pray for them, then find a simple place to begin your own prayer.",
    slugs: ["why-do-catholics-pray-to-saints", "what-is-prayer-catholic-guide-beginners"],
  },
  confirmation: {
    heading: "Take the next step with your chosen saint",
    introduction: "Turn your research into a thoughtful report and understand the Church’s titles for holy people.",
    slugs: ["how-to-write-confirmation-saint-report", "servant-of-god-venerable-blessed-saint-meaning"],
  },
  teachers: {
    heading: "Reading to support your lesson",
    introduction: "Pair the worksheet with a report outline or use the sacrament guide for a class discussion.",
    slugs: ["how-to-write-confirmation-saint-report", "seven-sacraments-catholic-church-explained"],
  },
} as const;

export default function ContextualReading({ context }: { context: keyof typeof paths }) {
  const path = paths[context];
  const headingId = `${context}-reading-title`;
  return <section className="blog-discovery" aria-labelledby={headingId}>
    <div className="blog-discovery-heading"><div><p className="eyebrow">From the Saint Discovery blog</p><h2 id={headingId}>{path.heading}</h2></div></div>
    <p className="blog-discovery-intro">{path.introduction}</p>
    <div className="blog-discovery-grid">{path.slugs.map((slug, index) => {
      const article = catalog.find(post => post.slug === slug);
      if (!article) return null;
      const { title, excerpt, category, publishedAt } = article;
      return <ArticleCard key={slug} post={{ slug, title, excerpt, category, publishedAt, reason: "" }} placement={`${context}_blog`} position={index + 1} />;
    })}</div>
  </section>;
}
