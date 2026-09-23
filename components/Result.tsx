"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import { motion } from "framer-motion";
import ShareButtons from "@/components/ShareButtons";
import EmailCapture from "@/components/EmailCapture";
import BlogRecommendations from "@/components/BlogRecommendations";
import { absoluteUrl } from "@/lib/seo";
import { Saint, TraitScores, TRAIT_KEYS } from "@/lib/types";
import { resultPath, strongestTraits } from "@/lib/quiz-results";
import { track } from "@/lib/analytics";

export default function Result({ saint, scores, relatedSaints, onRestart }: { saint: Saint; scores: TraitScores; relatedSaints: Saint[]; onRestart: () => void }) {
  const maxScore = Math.max(...TRAIT_KEYS.map(k => scores[k]), 1);
  const traits = strongestTraits(scores);
  const shareUrl = absoluteUrl(resultPath(saint.slug));
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="site-width result-layout">
    <div className="result-story">
      <p className="eyebrow">Your saint match</p>
      <h1 ref={heading} tabIndex={-1} className="outline-none">{saintDisplayName(saint)}</h1>
      {saint.tagline && <p className="font-heading text-2xl italic !text-gold mb-6">{saint.tagline}</p>}
      {saint.feast_day && <div className="inline-flex gap-3 border border-navy-lighter rounded-md px-4 py-2 text-sm mb-6"><span className="text-cream-dark">Feast day</span><span>{saint.feast_day}</span></div>}
      <p>{saint.description}</p>
      <div className="result-reading-invite"><p className="eyebrow">Your next chapter</p><h2>Get to know the person behind the match.</h2><p>Read the biography, explore its sources, and notice one choice or virtue you want to understand better.</p><Link href={`/saints/${saint.slug}`} onClick={() => track("biography_click", { saint_slug: saint.slug, link_placement: "result_primary" })} className="btn-primary">Read the full story <span aria-hidden>→</span></Link><p className="result-session-note">Your match and trait profile are kept in this browser tab so you can return after reading. Start a new quiz to clear them. Browser settings may limit recovery after a refresh.</p></div>
      <BlogRecommendations key={saint.slug} saintSlug={saint.slug} placement="result_blog" />
      <section className="result-share-panel" aria-labelledby="share-match-title"><p className="eyebrow">A discovery worth sharing</p><h2 id="share-match-title">Who will your friends get?</h2><p>Share your saint match and invite someone to find theirs. Your answers and trait scores stay off the shared page.</p><ShareButtons url={shareUrl} text={`I matched with ${saintDisplayName(saint)} on Saint Discovery. Which saint will you get?`} /><Link href={resultPath(saint.slug)} target="_blank" rel="noopener noreferrer" className="text-link">Preview my shared result <span className="sr-only">(opens in a new tab)</span> ↗</Link></section>
      {saint.prayer && <div className="result-prayer"><h2 className="eyebrow mb-3">A prayer to take with you</h2><p>{saint.prayer}</p></div>}
      <div className="flex flex-wrap gap-6 mt-5"><button onClick={onRestart} className="text-link">↻ Take the quiz again</button><Link href="/resources" className="text-link">Explore all saints →</Link></div>
    </div>
    <aside aria-label="Your traits and next steps">
      <section className="result-panel"><p className="eyebrow mb-3">What shaped your result</p><h2>Your spiritual profile</h2><p className="text-cream-dark text-sm leading-relaxed">{traits.length > 0 ? `Your answers leaned most toward ${traits.join(" and ")}. ` : "Your answers shaped this match. "}These quiz themes are starting points for reflection, not a measure of holiness or an exact personality assessment.</p>
        {TRAIT_KEYS.map(key => <div key={key} className="trait-row"><span className="capitalize text-cream-dark">{key}</span><div className="trait-track" role="meter" aria-label={key} aria-valuenow={scores[key]} aria-valuemin={0} aria-valuemax={maxScore}><motion.div className="trait-fill" initial={{ width: 0 }} animate={{ width: `${scores[key] / maxScore * 100}%` }} transition={{ duration: .5 }} /></div></div>)}
      </section>
      {saint.slug && <EmailCapture saintSlug={saint.slug} saintName={saintDisplayName(saint)} />}
      <section className="result-panel"><p className="eyebrow mb-3">Take the next step</p><h2>Make a connection</h2><div className="result-next-links"><Link href={`/saints/${saint.slug}`} onClick={() => track("biography_click", { saint_slug: saint.slug, link_placement: "result_next_steps" })}>Read the biography &amp; sources <span aria-hidden>↗</span></Link><Link href="/confirmation-saint-guide">Choosing a Confirmation saint? <span aria-hidden>↗</span></Link><Link href="/saint-of-day">Take a daily pause for prayer <span aria-hidden>↗</span></Link></div></section>
      <a href="https://ko-fi.com/saintquiz" target="_blank" rel="noopener noreferrer" className="text-link justify-center w-full">Enjoyed your discovery? Support us on Ko-fi ↗</a>
    </aside>
    {relatedSaints.length > 0 && <section className="result-explore" aria-labelledby="more-saints-title"><p className="eyebrow">Keep discovering</p><h2 id="more-saints-title">More lives you might connect with</h2><p>Other suggestions from your quiz answers. Read their stories and see what speaks to you.</p><div className="result-explore-grid">{relatedSaints.map(other => <Link key={other.slug} href={`/saints/${other.slug}`} onClick={() => track("biography_click", { saint_slug: other.slug, link_placement: "result_related" })} className="saint-card"><h3>{saintDisplayName(other)} <span aria-hidden>↗</span></h3>{other.feast_day && <p className="text-gold text-sm">Feast day · {other.feast_day}</p>}<p>{other.description}</p><span className="text-link">Explore this life →</span></Link>)}</div></section>}
  </motion.div>;
}
