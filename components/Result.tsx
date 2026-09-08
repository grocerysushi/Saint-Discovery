"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ShareButtons from "@/components/ShareButtons";
import EmailCapture from "@/components/EmailCapture";
import { absoluteUrl } from "@/lib/seo";
import { Saint, TraitScores, TRAIT_KEYS } from "@/lib/types";

export default function Result({ saint, scores, onRestart }: { saint: Saint; scores: TraitScores; onRestart: () => void }) {
  const maxScore = Math.max(...TRAIT_KEYS.map(k => scores[k]), 1);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="site-width result-layout">
    <div className="result-story">
      <p className="eyebrow">Your saint match</p>
      <h1 ref={heading} tabIndex={-1} className="outline-none">St. {saint.name}</h1>
      {saint.tagline && <p className="font-heading text-2xl italic !text-gold mb-6">{saint.tagline}</p>}
      {saint.feast_day && <div className="inline-flex gap-3 border border-navy-lighter rounded-md px-4 py-2 text-sm mb-6"><span className="text-cream-dark">Feast day</span><span>{saint.feast_day}</span></div>}
      <p>{saint.description}</p>
      {saint.prayer && <div className="result-prayer"><h2 className="eyebrow mb-3">A prayer to take with you</h2><p>{saint.prayer}</p></div>}
      {saint.slug && <Link href={`/saints/${saint.slug}`} className="btn-primary mt-3">Read the full story <span aria-hidden>↗</span></Link>}
      <div className="flex flex-wrap gap-6 mt-5"><button onClick={onRestart} className="text-link">↻ Take the quiz again</button><Link href="/resources" className="text-link">Explore all saints →</Link></div>
    </div>
    <aside aria-label="Your traits and next steps">
      <section className="result-panel"><p className="eyebrow mb-3">What makes you, you</p><h2>Your spiritual profile</h2><p className="text-cream-dark text-sm leading-relaxed">The six traits that shaped your match.</p>
        {TRAIT_KEYS.map(key => <div key={key} className="trait-row"><span className="capitalize text-cream-dark">{key}</span><div className="trait-track" role="meter" aria-label={key} aria-valuenow={scores[key]} aria-valuemin={0} aria-valuemax={maxScore}><motion.div className="trait-fill" initial={{ width: 0 }} animate={{ width: `${scores[key] / maxScore * 100}%` }} transition={{ duration: .5 }} /></div></div>)}
      </section>
      {saint.slug && <EmailCapture saintSlug={saint.slug} saintName={saint.name} />}
      <section className="result-panel"><h2 className="!text-xl !mb-2">Share your discovery</h2><ShareButtons url={absoluteUrl(saint.slug ? `/saints/${saint.slug}` : "/")} text={`I got St. ${saint.name} in the "Which Catholic Saint Are You?" quiz!`} /></section>
      <a href="https://ko-fi.com/saintquiz" target="_blank" rel="noopener noreferrer" className="text-link justify-center w-full">Enjoyed your discovery? Support us on Ko-fi ↗</a>
    </aside>
  </motion.div>;
}
