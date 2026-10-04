import Link from "next/link";
import { getSaintLearningGuide } from "@/lib/saint-learning-guides";

// Shared by the personal result and public share page. No answers or scores are read.
export default function ResultLearning({ slug, name }: { slug: string; name: string }) {
  const guide = getSaintLearningGuide(slug);
  const profile = `/saints/${slug}`;
  return <section className="result-panel my-8" aria-labelledby="result-learning-title">
    <p className="eyebrow mb-3">From a match to understanding</p>
    <h2 id="result-learning-title">Spend a few minutes with {name}</h2>
    <ol className="space-y-5 mt-5 list-decimal pl-6 text-cream-dark leading-relaxed">
      <li><Link className="text-link" href={`${profile}#biography`}>Read the life in context</Link><p>Identify one decision, the circumstances around it, and whom it affected. A quiz theme cannot capture a whole life.</p></li>
      <li><Link className="text-link" href={`${profile}#sources`}>Follow the evidence</Link><p>Open a cited source. Who wrote it, and how long after the events? Notice whether it describes an event, a religious tradition, or an interpretation.</p></li>
      <li>{guide ? <><Link className="text-link" href={`${profile}#reading-guide`}>{guide.reading.title}</Link><p>{guide.reading.exercise}</p></> : <><Link className="text-link" href={`${profile}#reflection`}>Choose a response to the story</Link><p>Write down one question the biography leaves you with, then one small action it inspires. Keep your application separate from what the historical person actually said or did.</p></>}</li>
    </ol>
    <p className="text-sm mt-5">These are study suggestions from Saint Discovery, not a saint’s words or a prescription for your vocation.</p>
    <Link href="/resources/reading" className="text-link mt-4">Compare two lives with a guided reading path</Link>
  </section>;
}
