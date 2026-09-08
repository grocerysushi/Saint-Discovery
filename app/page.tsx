import type { Metadata } from "next";
import Link from "next/link";
import HomePage from "@/components/HomePage";
import { getSaintOfDay } from "@/lib/saint-of-day";

export const revalidate = 300;
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Which Catholic Saint Are You?",
  description:
    "Take the Catholic saint personality quiz and discover which of nearly 500 saints reflects your spiritual gifts. Free, fast, and rooted in Catholic tradition.",
  keywords: [
    "which catholic saint are you",
    "which catholic saint are you quiz",
    "catholic saint quiz",
    "catholic saint personality quiz",
    "patron saint quiz",
    "what catholic saint am i",
    "discover your catholic saint",
    "saint quiz free",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Which Catholic Saint Are You? Quiz",
    description:
      "Take the Catholic saint quiz, learn which saint you most resemble, and explore the meaning behind your result.",
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Saint Discovery Catholic saint quiz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Which Catholic Saint Are You? Quiz",
    description:
      "Take the Catholic saint quiz and discover the saint who reflects your spiritual gifts.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

const FAQS = [
  {
    q: "What is the Catholic saint quiz?",
    a: "Saint Discovery is a free 21-question personality quiz rooted in Catholic tradition. Your answers are scored across six spiritual traits — contemplative, charitable, intellectual, courageous, joyful, and mystical — and matched with the saint whose life and virtues most closely resemble yours.",
  },
  {
    q: "How long does the saint quiz take?",
    a: "Most people finish in three to five minutes. There are 21 questions, and you'll see your saint match as soon as you answer the last one.",
  },
  {
    q: "Is the saint quiz free?",
    a: "Yes. The quiz, every saint biography, the prayers, and the directory are all free. There is no sign-up required to take the quiz or read your result.",
  },
  {
    q: "How many saints can I match with?",
    a: "Saint Discovery includes nearly 500 canonized Catholic saints — from early martyrs and Doctors of the Church to modern saints like Maximilian Kolbe and Thérèse of Lisieux.",
  },
  {
    q: "Is this the same as a patron saint?",
    a: "Not quite. A patron saint is traditionally tied to a vocation, place, or cause. This quiz matches you with a saint whose personality and spiritual gifts resemble your own — a companion for prayer and inspiration rather than a formal patron.",
  },
];

export default function Home() {
  const quizJsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: "Which Catholic Saint Are You?",
    description:
      "A 21-question Catholic personality quiz that matches you with a canonized saint whose virtues reflect your own.",
    url: absoluteUrl("/"),
    educationalUse: "Self-reflection",
    learningResourceType: "Quiz",
    about: {
      "@type": "Thing",
      name: "Catholic Saints",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomePage dailySaint={getSaintOfDay()} />
      <div className="site-width home-information">
        <section className="home-about editorial-grid">
          <div><p className="eyebrow">More than a name</p><h2>Real people.<br />Remarkable faith.</h2></div>
          <div className="editorial-copy">
            <p>The saints had their own personalities, struggles, and gifts. Some found God in quiet contemplation. Others lived their faith through bold action, boundless generosity, or everyday joy.</p>
            <p>Our free Catholic personality quiz explores six spiritual traits to introduce you to a saint whose life reflects your own. Your result includes their story, feast day, and a prayer to take with you.</p>
            <Link href="/about" className="text-link text-gold">The story behind Saint Discovery <span aria-hidden>↗</span></Link>
          </div>
        </section>
        <section className="faq-section editorial-grid">
          <div><p className="eyebrow">A few things to know</p><h2>A little curiosity<br />goes a long way.</h2><Link href="/resources" className="text-link mt-5">Browse all saints &amp; resources <span aria-hidden>↗</span></Link></div>
          <div className="faq-list">{FAQS.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
        </section>
      </div>
    </>
  );
}
