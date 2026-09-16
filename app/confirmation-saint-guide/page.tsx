import type { Metadata } from "next";
import Link from "next/link";
import ConfirmationSaintPicker from "@/components/ConfirmationSaintPicker";
import { CONFIRMATION_FAQS, CONFIRMATION_PICKS } from "@/lib/confirmation-guide";
import { getAllSaints } from "@/lib/saints";
import { saintDisplayName } from "@/lib/saint-seo";
import { absoluteUrl, serializeJsonLd, siteConfig } from "@/lib/seo";

const title = "How to Choose a Confirmation Saint";
const description = "Choose a Confirmation saint with a practical guide, saint suggestions, a personal shortlist, and a downloadable reflection to discuss with your sponsor.";
const path = "/confirmation-saint-guide";
export const metadata: Metadata = {
  title, description, alternates: { canonical: path },
  openGraph: { title, description, url: absoluteUrl(path), type: "article", siteName: siteConfig.name, images: [absoluteUrl("/opengraph-image")] },
  twitter: { card: "summary_large_image", title, description, images: [absoluteUrl("/opengraph-image")] },
};

const STEPS = [
  { title: "Begin with prayer", text: "Ask the Holy Spirit for help as you prepare for Confirmation. Think about where you need to grow: patience, courage, generosity, a habit of prayer, or trust in God." },
  { title: "Read a few lives", text: "Start with your baptismal name, someone you already admire, or a theme below. Read the full biography and its sources. Notice the person’s choices and struggles, not just a famous story or patronage." },
  { title: "Make a small shortlist", text: "Choose two or three people to learn about more deeply. You might recognize something of yourself in a saint, or feel challenged by a virtue you do not yet find easy." },
  { title: "Talk with your sponsor", text: "Explain what draws you to each person. Ask your sponsor or catechist about your parish’s name requirements, deadlines, and any written reflection. Confirm your proposed choice with them." },
  { title: "Put one virtue into practice", text: "Choose a concrete action: help someone quietly, set aside time for prayer, or show patience in a difficult conversation. Keep learning about your saint after Confirmation, too." },
];

export default async function ConfirmationSaintGuide() {
  const saints = await getAllSaints();
  const candidates = CONFIRMATION_PICKS.map(pick => {
    const saint = saints.find(saint => saint.slug === pick.slug);
    if (!saint || saint.kind !== "saint") throw new Error(`Confirmation suggestion requires a reviewed Catholic saint: ${pick.slug}`);
    return { ...pick, name: saintDisplayName(saint), description: saint.description ?? "" };
  });
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Article", headline: title, description, url: absoluteUrl(path), mainEntityOfPage: absoluteUrl(path), author: { "@type": "Organization", name: siteConfig.name }, citation: ["https://www.usccb.org/sites/default/files/flipbooks/uscca/files/assets/basic-html/page-234.html", "https://www.usccb.org/sites/default/files/flipbooks/catechism/523/"] },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Confirmation saint guide", item: absoluteUrl(path) }] },
  ];
  return <main className="site-width guide-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
    <header className="guide-hero">
      <div><p className="eyebrow">Preparing for Confirmation</p><h1>Choose a saint.<br /><em>A companion for life.</em></h1><p className="guide-lead">A guide to choosing your Confirmation saint, with room to reflect, explore, and find a life that helps you follow Jesus.</p><div className="hero-actions"><a href="#explore-saints" className="btn-primary">Explore the saints <span aria-hidden>↓</span></a><a href="#choosing" className="text-link">Start with the guide <span aria-hidden>↗</span></a></div></div>
      <aside className="guide-intro-note"><p className="eyebrow">Start here</p><h2>Who helps you grow closer to Christ?</h2><p>A patron saint offers an example of Christian life and someone whose intercession you can ask for. Let that relationship guide your choice.</p><p>Start by checking your parish’s instructions. Your baptismal name may already offer a meaningful connection.</p><a className="text-link underline" href="#guide-sources">Read the Church sources</a></aside>
    </header>
    <nav className="guide-jump-links" aria-label="On this page"><a href="#choosing">01 · The guide</a><a href="#explore-saints">02 · Saint suggestions</a><a href="#my-shortlist">03 · Your reflection</a><a href="#questions">04 · Common questions</a></nav>
    <section id="choosing" className="guide-section" aria-labelledby="choosing-title"><p className="eyebrow">A thoughtful beginning</p><h2 id="choosing-title">How to choose a Confirmation saint</h2><ol className="guide-steps">{STEPS.map((step, index) => <li key={step.title}><span className="guide-step-number" aria-hidden>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></section>
    <section id="explore-saints" className="guide-section" aria-labelledby="explore-title"><p className="eyebrow">Lives worth getting to know</p><h2 id="explore-title">Where would you like to grow?</h2><p className="guide-section-intro">These themes are reading suggestions, not official patronages or a ranking. Every card links to a reviewed biography with sources. Start here, or <Link href="/resources" className="text-gold underline">explore the full directory</Link>.</p><ConfirmationSaintPicker candidates={candidates} /></section>
    <section className="guide-quiz-callout"><div><p className="eyebrow">Still looking for a starting point?</p><h2>Let curiosity lead you to a story.</h2><p>Our personality quiz can suggest another life to explore. Bring any result back to prayer, research, and a conversation with your sponsor.</p></div><Link className="btn-secondary" href="/quiz">Take the saint quiz <span aria-hidden>↗</span></Link></section>
    <section id="questions" className="guide-section" aria-labelledby="questions-title"><p className="eyebrow">Common questions</p><h2 id="questions-title">Before you choose</h2><div className="faq-list">{CONFIRMATION_FAQS.map(faq => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div></section>
    <section id="guide-sources" className="guide-sources" aria-labelledby="sources-title"><h2 id="sources-title">Sources &amp; further reading</h2><p>This guide offers reflection prompts for candidates and sponsors. Your parish provides the requirements for your preparation.</p><ul><li><a href="https://www.usccb.org/sites/default/files/flipbooks/uscca/files/assets/basic-html/page-234.html">US Catholic Catechism for Adults, p. 206: Confirmation and the baptismal name</a></li><li><a href="https://www.usccb.org/sites/default/files/flipbooks/catechism/523/">Catechism of the Catholic Church, §2156: the Christian name and patron saint</a></li><li><a href="https://www.usccb.org/prayer-and-worship/sacraments-and-sacramentals/confirmation">USCCB: the Sacrament of Confirmation</a></li></ul><p>Historical sources for each suggested saint appear on their biography page.</p></section>
  </main>;
}
