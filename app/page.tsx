import type { Metadata } from "next";
import Link from "next/link";
import HomePage from "@/components/HomePage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Which Catholic Saint Are You?",
  description:
    "Take the Catholic saint personality quiz and discover which of 500+ saints reflects your spiritual gifts. Free, fast, and rooted in Catholic tradition.",
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
    a: "Saint Discovery includes more than 500 canonized Catholic saints — from early martyrs and Doctors of the Church to modern saints like Maximilian Kolbe and Thérèse of Lisieux.",
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
      <HomePage />
      <section className="relative bg-navy text-cream-dark border-t border-navy-lighter">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-cream mb-6">
            About the Catholic Saint Quiz
          </h2>
          <p className="leading-relaxed mb-4">
            <strong className="text-cream">Saint Discovery</strong> is a free
            Catholic personality quiz that pairs you with one of more than 500
            canonized saints. Your 21 answers are scored across six spiritual
            traits — contemplative, charitable, intellectual, courageous,
            joyful, and mystical — and matched against the lives of saints
            whose virtues reflect your own.
          </p>
          <p className="leading-relaxed mb-4">
            Whether you are exploring the Catholic faith, looking for a saint
            to walk with you in prayer, or simply curious which saint you most
            resemble, the quiz is a quick and reverent way to start. Every
            result includes the saint&rsquo;s biography, feast day, and a
            traditional prayer.
          </p>
          <p className="leading-relaxed mb-10">
            Looking for a specific saint instead? Browse the full{" "}
            <Link href="/resources" className="text-gold hover:underline">
              Catholic saints directory
            </Link>{" "}
            to search by name, feast day, or patronage.
          </p>

          <h2 className="text-3xl md:text-4xl font-heading font-bold text-cream mb-6">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-6">
            {FAQS.map((f) => (
              <div key={f.q}>
                <dt className="text-cream font-semibold text-lg mb-2">
                  {f.q}
                </dt>
                <dd className="leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 text-center">
            <Link
              href="/resources"
              className="inline-block px-8 py-3 border border-gold/40 text-gold rounded-full hover:bg-gold/10 transition-colors"
            >
              Explore All Saints &amp; Resources
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
