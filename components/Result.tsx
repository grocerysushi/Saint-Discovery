"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import { motion } from "framer-motion";
import ResultShare from "@/components/ResultShare";
import EmailCapture from "@/components/EmailCapture";
import BlogRecommendations from "@/components/BlogRecommendations";
import { Saint, TraitScores, TRAIT_KEYS } from "@/lib/types";
import { strongestTraits } from "@/lib/quiz-results";
import { track } from "@/lib/analytics";
import ResultLearning from "@/components/ResultLearning";
import ResultSocialLinks from "@/components/ResultSocialLinks";
import ResultArtwork from "@/components/ResultArtwork";
import SaintCompanion from "@/components/SaintCompanion";

const SECTIONS = ["Read & reflect", "Keep & share", "Why this match"];

export default function Result({ saint, scores, relatedSaints, onRestart }: { saint: Saint; scores: TraitScores; relatedSaints: Saint[]; onRestart: () => void }) {
  const maxScore = Math.max(...TRAIT_KEYS.map(k => scores[k]), 1);
  const traits = strongestTraits(scores);
  const name = saintDisplayName(saint);
  const [section, setSection] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const keepPanel = useRef<HTMLDivElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  function openKeep() {
    setSection(1);
    requestAnimationFrame(() => { keepPanel.current?.scrollIntoView({ block: "start" }); keepPanel.current?.focus({ preventScroll: true }); });
  }
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="site-width result-layout result-reading-room">
    <div className="result-feature">
      <div className="result-portrait"><ResultArtwork slug={saint.slug} name={name} /></div>
      <div className="result-intro">
        <p className="room-match-label">Your saint match</p>
        <h1 ref={heading} tabIndex={-1} className="outline-none">{name}</h1>
        {saint.feast_day && <p className="room-feast">Feast day <span>{saint.feast_day}</span></p>}
        {saint.tagline && <p className="room-tagline">{saint.tagline}</p>}
        <p className="result-match-summary">{saint.description}</p>
        <div className="room-primary-actions">
          <Link prefetch={false} href={`/saints/${saint.slug}`} onClick={() => track("biography_click", { saint_slug: saint.slug, link_placement: "result_primary" })} className="btn-primary">Read the full story <span aria-hidden>↗</span></Link>
          <button type="button" onClick={openKeep}>Keep my result</button>
        </div>
        <div className="room-match-note"><p>{traits.length ? <>Your answers leaned toward <strong>{traits.join(" and ")}</strong>.</> : "Your answers shaped this match."}</p><button type="button" onClick={() => { setSection(2); tabs.current[2]?.focus(); tabs.current[2]?.scrollIntoView({ block: "center" }); }}>See how your match works</button></div>
      </div>
    </div>

    <section className="result-desk" aria-label="Continue your discovery">
      <div className="room-desk-heading"><h2>Make this discovery yours.</h2><p>Read a life. Keep a thought. Return when you like.</p></div>
      <div className="room-tabs" role="tablist" aria-label="Explore your result">{SECTIONS.map((label, index) => <button key={label} ref={node => { tabs.current[index] = node; }} type="button" role="tab" id={`result-tab-${index}`} aria-controls={`result-panel-${index}`} aria-selected={section === index} tabIndex={section === index ? 0 : -1} onClick={() => setSection(index)} onKeyDown={event => {
        const next = event.key === "ArrowRight" ? (index + 1) % SECTIONS.length : event.key === "ArrowLeft" ? (index + SECTIONS.length - 1) % SECTIONS.length : event.key === "Home" ? 0 : event.key === "End" ? SECTIONS.length - 1 : null;
        if (next !== null) { event.preventDefault(); setSection(next); tabs.current[next]?.focus(); }
      }}>{label}</button>)}</div>

      <div id="result-panel-0" role="tabpanel" aria-labelledby="result-tab-0" tabIndex={0} hidden={section !== 0} className="room-panel">
        <div className="room-reading-grid"><SaintCompanion name={name} slug={saint.slug} /><aside className="room-reading-note"><p>A small beginning</p><h3>One life.<br /> Your own pace.</h3><p>You do not need to finish everything today. Start with the biography, then return to a question or a small act of service.</p><Link prefetch={false} href="/confirmation-saint-guide">Choosing a Confirmation saint?</Link><Link prefetch={false} href="/saint-of-day">Take a daily pause for prayer</Link></aside></div>
        {saint.prayer && <div className="result-prayer"><h2>A prayer to take with you</h2><p>{saint.prayer}</p></div>}
        <details className="home-disclosure"><summary>Explore this life more deeply</summary><ResultLearning slug={saint.slug} name={name} /><BlogRecommendations key={saint.slug} saintSlug={saint.slug} placement="result_blog" /></details>
      </div>

      <div ref={keepPanel} id="result-panel-1" role="tabpanel" aria-labelledby="result-tab-1" tabIndex={0} hidden={section !== 1} className="room-panel">
        <div className="room-keep-grid"><div><ResultShare slug={saint.slug} name={name} matched /><ResultSocialLinks placement="quiz_result" /></div><div><EmailCapture saintSlug={saint.slug} saintName={name} /><p className="room-storage-note">Your match and trait profile stay in this browser tab so you can return after reading. Start a new quiz to clear them. Browser settings may limit recovery after a refresh.</p></div></div>
      </div>

      <div id="result-panel-2" role="tabpanel" aria-labelledby="result-tab-2" tabIndex={0} hidden={section !== 2} className="room-panel">
        <section className="room-profile"><div><p>What shaped your result</p><h3>Your spiritual profile</h3><p>{traits.length ? `Your answers leaned most toward ${traits.join(" and ")}. ` : "Your answers shaped this match. "}We compare the balance of all six themes with the themes assigned to each saint’s life. These quiz themes are starting points for reflection, not a measure of holiness or an exact personality assessment.</p></div><div>{TRAIT_KEYS.map(key => <div key={key} className="trait-row"><span className="capitalize text-cream-dark">{key}</span><div className="trait-track" role="meter" aria-label={key} aria-valuenow={scores[key]} aria-valuemin={0} aria-valuemax={maxScore}><div className="trait-fill" style={{ width: `${scores[key] / maxScore * 100}%` }} /></div></div>)}</div></section>
        {relatedSaints.length > 0 && <section className="result-explore" aria-labelledby="more-saints-title"><h2 id="more-saints-title">More lives you might connect with</h2><p>Other suggestions from your quiz answers. Read their stories and see what speaks to you.</p><div className="result-explore-grid">{relatedSaints.map(other => <Link prefetch={false} key={other.slug} href={`/saints/${other.slug}`} onClick={() => track("biography_click", { saint_slug: other.slug, link_placement: "result_related" })} className="saint-card"><h3>{saintDisplayName(other)} <span aria-hidden>↗</span></h3>{other.feast_day && <p className="text-gold text-sm">Feast day · {other.feast_day}</p>}<p>{other.description}</p><span className="text-link">Explore this life →</span></Link>)}</div></section>}
      </div>
    </section>
    <div className="room-bottom-links"><button type="button" onClick={onRestart}>Take the quiz again</button><Link prefetch={false} href="/resources">Explore all saints</Link><a href="https://ko-fi.com/saintquiz" target="_blank" rel="noopener noreferrer">Support Saint Discovery on Ko-fi ↗</a></div>
  </motion.div>;
}
