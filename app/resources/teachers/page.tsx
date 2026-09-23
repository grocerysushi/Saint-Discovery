import type { Metadata } from "next";
import Link from "next/link";
import EducatorDownload from "@/components/EducatorDownload";
import content from "@/data/educator-resources.json";
import { absoluteUrl, serializeJsonLd, siteConfig } from "@/lib/seo";

const path = "/resources/teachers";
const title = "Free Saint Worksheets & Confirmation Lesson Guide";
const description = "Download a free saint-reflection worksheet and 45-minute Confirmation lesson guide for teachers and catechists. Printable PDFs and online text, no signup.";

export const metadata: Metadata = {
  title, description, alternates: { canonical: path },
  openGraph: { title, description, url: absoluteUrl(path), type: "website", images: [absoluteUrl("/opengraph-image")] },
  twitter: { card: "summary_large_image", title, description, images: [absoluteUrl("/opengraph-image")] },
};

// Keep the numbered references next to the teaching they support in the online edition.
function CitedText({ text }: { text: string }) {
  return text.split(/(\[\d+(?:, \d+)*\])/g).map((part, index) => /^\[\d/.test(part)
    ? <span key={index}>[{part.slice(1, -1).split(", ").map((number, i) => <span key={number}>{i > 0 && ", "}<a href={`#teacher-source-${number}`} aria-label={`Source ${number}`}>{number}</a></span>)}]</span>
    : part);
}

export default function TeacherResources() {
  const resources = [content.worksheet, content.lesson];
  const schema = [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: title, description, url: absoluteUrl(path),
      hasPart: resources.map((resource, i) => ({
        "@type": "LearningResource", name: resource.title, description: resource.description,
        url: absoluteUrl(`${path}#${i === 0 ? "worksheet" : "lesson"}`),
        learningResourceType: i === 0 ? "Worksheet" : "Lesson plan", inLanguage: "en", isAccessibleForFree: true,
        educationalLevel: ["Middle school", "High school"],
        audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
        author: { "@type": "Organization", name: siteConfig.name },
        encoding: { "@type": "MediaObject", contentUrl: absoluteUrl(`/downloads/educators/${resource.filename}`), encodingFormat: "application/pdf" },
      })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Resources", item: absoluteUrl("/resources") },
      { "@type": "ListItem", position: 3, name: "Teachers & catechists", item: absoluteUrl(path) },
    ] },
  ];

  return <main className="site-width guide-page educator-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    <header className="page-intro">
      <p className="eyebrow">For teachers &amp; catechists</p>
      <h1>Bring the saints<br /><em className="text-gold">into the classroom.</em></h1>
      <p>Ready-to-use saint reflections and a Confirmation lesson that connect a life of faith to one small, everyday action.</p>
      <p className="educator-free-note">Free to use. No signup. Print-friendly PDFs.</p>
    </header>

    <section className="educator-downloads" aria-label="Download teaching resources">
      {resources.map((resource, i) => <article className="educator-card" key={resource.filename}>
        <div className="educator-paper-preview" aria-hidden="true"><span>{i === 0 ? "READ · REFLECT · ACT" : "PREPARE · TEACH · FOLLOW UP"}</span><strong>{i === 0 ? "A life worth\nlearning from." : "A saint to\nwalk with."}</strong><div className="educator-paper-lines" /><small>SAINT DISCOVERY</small></div>
        <div className="educator-card-body">
          <p className="eyebrow">{i === 0 ? "2 pages · Student worksheet" : "3 pages · 45-minute lesson"}</p>
          <h2>{resource.title}</h2><p>{resource.description}</p>
          <EducatorDownload filename={resource.filename}>{i === 0 ? "Download worksheet (PDF)" : "Download lesson (PDF)"}</EducatorDownload>
          <a className="text-link" href={i === 0 ? "#worksheet" : "#lesson"}>Read {i === 0 ? "the worksheet" : "the lesson"} online <span aria-hidden>↓</span></a>
        </div>
      </article>)}
    </section>

    <section className="educator-start" aria-labelledby="classroom-start">
      <div><p className="eyebrow">A little preparation. A meaningful conversation.</p><h2 id="classroom-start">Start with your group.</h2></div>
      <ol><li><strong>Choose a life.</strong> Preview a biography from the <Link href="/resources">saints directory</Link> for your learners’ reading level.</li><li><strong>Print or share.</strong> Print on US Letter paper at actual size, or fit to A4. Attach the PDF or this page to a Google Classroom assignment.</li><li><strong>Make room for reflection.</strong> Learners can write on paper or answer in a separate document. Personal prayers and reflections can stay private.</li></ol>
      <p>Designed for middle and high school groups, with adaptations for younger learners and adult OCIA. Use alongside your parish’s preparation program. The PDFs are printable documents, not interactive forms.</p>
    </section>

    <section id="worksheet" className="guide-section educator-online" aria-labelledby="worksheet-heading">
      <p className="eyebrow">Student resource · Online edition</p><h2 id="worksheet-heading">{content.worksheet.title}</h2>
      {content.worksheet.pages.map(page => <div key={page.title}><h3>{page.title}</h3><p>{page.intro}</p><ul className="educator-prompts">{page.fields.map(field => <li key={field.label}>{field.label}</li>)}</ul></div>)}
      <p>Find a biography in the <Link href="/resources">saints directory</Link>, or explore the <Link href="/saint-of-day">Saint of the Day</Link> together.</p>
    </section>

    <section id="lesson" className="guide-section educator-online" aria-labelledby="lesson-heading">
      <p className="eyebrow">Teacher resource · Online edition</p><h2 id="lesson-heading">{content.lesson.title}</h2>
      <p>{content.lesson.description}</p>
      {content.lesson.pages.map((page, i) => <details className="educator-lesson-section" key={page.title} open={i === 0}>
        <summary>{String(i + 1).padStart(2, "0")} · {page.title}</summary>
        {page.sections.map(section => <div key={section.title}><h3>{section.title}</h3>{section.body.map(body => <p key={body}><CitedText text={body} /></p>)}</div>)}
      </details>)}
      <p>For a candidate’s next step, use the <Link href="/confirmation-saint-guide">Confirmation saint selection guide</Link> with their sponsor or catechist.</p>
    </section>

    <section className="guide-sources" aria-labelledby="teacher-sources"><h2 id="teacher-sources">Sources &amp; classroom use</h2>
      <ol>{content.sources.map((source, i) => <li id={`teacher-source-${i + 1}`} key={source.url}><a href={source.url}>{i + 1}. {source.label}</a></li>)}</ol>
      <p>{content.permission}</p><p>Prepared September 23, 2026. These independent teaching resources are not an official diocesan curriculum.</p>
    </section>
  </main>;
}
