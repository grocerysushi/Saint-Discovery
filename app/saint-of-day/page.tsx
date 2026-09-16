import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DailyExperience from "@/components/DailyExperience";
import { getDailyExperience } from "@/lib/daily-experience";
import { localDateKey } from "@/lib/calendar-date";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";

type Props = { searchParams: Promise<{ date?: string | string[] }> };
export const dynamic = "force-dynamic";
const title = "Saint of the Day: A Daily Story, Reflection & Prayer";
const description = "Discover the saint of the day, read a sourced biography, pause for reflection and prayer, and choose one simple action to carry into your day.";
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { date } = await searchParams;
  return { title, description, alternates: { canonical: "/saint-of-day" },
    ...(date ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, url: absoluteUrl("/saint-of-day"), type: "website", images: [absoluteUrl("/opengraph-image")] },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl("/opengraph-image")] },
  };
}
export default async function SaintOfDayPage({ searchParams }: Props) {
  const { date } = await searchParams;
  if (Array.isArray(date)) notFound();
  const daily = await getDailyExperience(date ?? localDateKey());
  if (!daily) notFound();
  const breadcrumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Saint of the Day", item: absoluteUrl("/saint-of-day") }] };
  return <main className="site-width daily-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }} /><DailyExperience key={date ?? "today"} initial={daily} followToday={!date} /></main>;
}
