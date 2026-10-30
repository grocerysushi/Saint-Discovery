import type { BlogSummary } from "./blog-public";

// Editorial starting points, not personalized recommendations or popularity rankings.
export const BLOG_STARTING_POINTS = [
  { id: "prayer", label: "I want to learn to pray", shortLabel: "Prayer", slug: "what-is-prayer-catholic-guide-beginners", note: "Start with what prayer means. Then try reading a short passage of Scripture prayerfully.", nextLabel: "Try lectio divina", nextUrl: "/blog/how-to-pray-lectio-divina-catholic-guide" },
  { id: "confirmation", label: "I’m preparing for Confirmation", shortLabel: "Confirmation", slug: "how-to-write-confirmation-saint-report", note: "Learn what makes a thoughtful saint report. Use the guide to compare the lives behind your possible choices.", nextLabel: "Explore the Confirmation saint guide", nextUrl: "/confirmation-saint-guide" },
  { id: "faith", label: "I have questions about Catholic faith", shortLabel: "Catholic faith", slug: "seven-sacraments-catholic-church-explained", note: "Begin with the seven sacraments, then use the teaching resources for further reading and discussion.", nextLabel: "Explore teaching resources", nextUrl: "/resources/teachers" },
] as const;

export type BlogStartingPoint = { id: string; article: BlogSummary["published"] };
