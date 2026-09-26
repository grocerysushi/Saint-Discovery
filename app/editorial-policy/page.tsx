import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Editorial approach & corrections",
  description: "How Saint Discovery prepares biographies and articles, uses sources and AI assistance, distinguishes history from tradition, and handles corrections.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicy() {
  return <main className="reading-page">
    <p className="eyebrow mb-3">About our content</p>
    <h1 className="text-4xl md:text-5xl font-heading mb-6">Editorial approach &amp; corrections</h1>
    <div className="text-cream-dark leading-relaxed space-y-8">
      <p>Saint Discovery is an independent Catholic learning project. We publish saint biographies, practical faith guides, and a personality quiz to help readers begin exploring the saints. The site is not an official publication of a diocese, the Vatican, or the USCCB, and citing those organizations does not imply their endorsement.</p>
      <section><h2 className="text-2xl text-cream mb-3">Who prepares the content</h2><p>Articles credited to Saint Discovery are published under the site’s name. AI tools assist with research, drafting, and editing, including scheduled journal articles and biography revisions. A source link or a “source-reviewed” label is not a claim of independent human fact-checking, theological review, or ecclesiastical approval. We do not claim those reviews where they have not taken place.</p></section>
      <section><h2 className="text-2xl text-cream mb-3">Sources and historical uncertainty</h2><p>Our research draws on Scripture, Vatican and bishops’ conference publications, dioceses, religious communities, and historical reference works. Biographies include a source list; journal articles link to references within the text. Readers can follow those links to examine the evidence and context.</p><p className="mt-3">Documented history, biblical accounts, and later devotional traditions do not have the same evidential basis. We aim to identify those differences, explain uncertain dates or identities, and avoid adding details simply to make a short historical record longer. Feast-day observances can differ by location and calendar; consult your parish for its liturgical celebration.</p></section>
      <section><h2 className="text-2xl text-cream mb-3">Reflection, prayers, and the quiz</h2><p>Practical exercises are suggestions for reflection. Original prayers should be identified as original rather than attributed to a saint. The quiz compares your answers with a set of spiritual traits to suggest a saint to explore. It is not a psychological assessment, a spiritual diagnosis, or an authoritative decision about your patron or Confirmation name.</p><p className="mt-3">Use the <Link className="text-link" href="/confirmation-saint-guide">Confirmation guide</Link> alongside your parish’s requirements and conversations with your sponsor. Personal pastoral questions belong in a conversation with a priest or another appropriate adviser.</p></section>
      <section><h2 className="text-2xl text-cream mb-3">Artwork and attribution</h2><p>Historical artwork is credited where displayed, with source and rights information when available. Some saint illustrations are AI-generated artistic interpretations; they are not historical portraits or evidence of a person’s appearance. Please report an incorrect credit or a rights concern with the page URL and the image in question.</p></section>
      <section><h2 className="text-2xl text-cream mb-3">Corrections and updates</h2><p>Send corrections to <a className="text-link" href="mailto:hello@saintdiscoveryquiz.com?subject=Content%20correction">hello@saintdiscoveryquiz.com</a>. Include the page URL, the passage you are questioning, and a reliable source or explanation. This helps us investigate the specific claim. Publication dates identify when a journal article first appeared; biography review dates identify the recorded content revision, not a guarantee that every claim is beyond dispute.</p></section>
      <section><h2 className="text-2xl text-cream mb-3">Advertising and access</h2><p>The quiz, biographies, and learning resources are free to use. Advertising is planned for the blog only. Advertisement placements are separate from editorial material; an advertisement does not constitute a recommendation by Saint Discovery. See our <Link className="text-link" href="/privacy">privacy policy</Link> for information about data and service providers.</p></section>
      <p><Link className="text-link" href="/about">About Saint Discovery →</Link></p>
    </div>
  </main>;
}
