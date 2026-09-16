import { getSaintOfDay } from "@/lib/saint-of-day";
import { getAllSaints } from "@/lib/saints";
import { getBiographyReview } from "@/lib/saint-reviews";
import { validDateKey, localDateKey } from "@/lib/calendar-date";
import { saintDisplayName } from "@/lib/saint-seo";

// Original editorial prompts, never quotations or prayers attributed to a saint.
const REFLECTIONS = [
  { theme: "Make room for kindness", question: "Who might need your attention more than your advice today? As you read this life, notice the relationships and choices it brings to mind.", action: "Give someone five minutes of undivided attention. Listen without planning your reply.", prayer: "Lord Jesus, help me notice the people I hurry past. Teach me to listen with patience and respond with love. Amen." },
  { theme: "Take one faithful step", question: "Where are you waiting to feel completely ready? Reflect on one small step you can take toward a responsibility you have been avoiding.", action: "Choose one good task you have put off and spend ten minutes beginning it.", prayer: "Holy Spirit, give me courage for the next good step. Help me act with wisdom, humility, and trust. Amen." },
  { theme: "Let gratitude become generosity", question: "What have you received that you can share? Consider a gift of time, skill, encouragement, or material help.", action: "Thank someone specifically, then find one practical way to help another person.", prayer: "God of all goodness, thank you for the gifts I receive. Open my hands and my heart so that I may share them freely. Amen." },
  { theme: "Begin again", question: "What habit needs a fresh beginning? Let your reading invite honest reflection without expecting yourself to become perfect overnight.", action: "Choose one small change you can practice today. If you fall short, begin again patiently.", prayer: "Merciful Father, help me acknowledge my faults and receive your mercy. Give me patience to begin again and grace to grow in love. Amen." },
  { theme: "Make space for prayer", question: "What keeps your attention scattered? Consider what a few quiet minutes might allow you to bring honestly before God.", action: "Set aside five quiet minutes. Name one gratitude, one concern, and one person you want to pray for.", prayer: "Lord, meet me in this quiet moment. Help me bring you my hopes and worries, and teach me to listen. Amen." },
  { theme: "Seek understanding", question: "What question about faith would you like to explore? Notice what you understand in today’s biography and what deserves a closer look at its sources.", action: "Read one of the biography’s sources, or write down a question to discuss with a trusted catechist.", prayer: "God of truth, guide my questions and deepen my understanding. Help me learn with humility and put what I learn into practice. Amen." },
  { theme: "Serve quietly", question: "What good could you do without receiving recognition? Consider how an ordinary act can become a sincere expression of love.", action: "Do one useful thing for someone without drawing attention to yourself.", prayer: "Jesus, teach me to serve with a generous heart. Free me from the need for praise and help me love in ordinary ways. Amen." },
];

export async function getDailyExperience(date = localDateKey()) {
  if (!validDateKey(date)) return null;
  const featured = getSaintOfDay(date);
  const [month, day] = date.split("-").map(Number);
  const label = new Date(2024, month - 1, day).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const saints = (await getAllSaints()).filter(saint => saint.feast_day === label);
  const review = featured ? getBiographyReview(featured.slug) : null;
  return {
    date, label, featured,
    biography: review?.biography ?? [],
    sources: review?.sources ?? [],
    feastNote: review?.feast_note ?? "",
    alsoToday: saints.filter(saint => saint.slug !== featured?.slug).map(saint => ({ slug: saint.slug, name: saintDisplayName(saint), kind: saint.kind })),
    reflection: REFLECTIONS[((month - 1) * 31 + day - 1) % REFLECTIONS.length],
  };
}

export type DailyExperienceData = NonNullable<Awaited<ReturnType<typeof getDailyExperience>>>;
