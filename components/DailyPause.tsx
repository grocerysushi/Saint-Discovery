"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { DailyExperienceData } from "@/lib/daily-experience";
import "./daily-pause.css";

const steps = ["Read", "Reflect", "Pray", "Act"];

export default function DailyPause({ daily, name, artwork, children }: { daily: DailyExperienceData; name: string | null; artwork: ReactNode; children: ReactNode }) {
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const headings = ["Meet the life behind the name", "A question to sit with", "Pause in God’s presence", "One small good thing"];
  const choose = (index: number, focusPanel = false) => {
    setActive(index);
    requestAnimationFrame(() => {
      if (focusPanel) { panels.current[index]?.focus({ preventScroll: true }); panels.current[index]?.scrollIntoView({ block: "nearest", behavior: "instant" }); }
      else tabs.current[index]?.focus({ preventScroll: true });
    });
  };
  return <section className="daily-pause" aria-label="A daily pause with the saints">
    <aside className="pause-life">
      <p>{daily.label} · {daily.featured?.kind === "observance" ? "An observance" : "A life to discover"}</p>
      <h2>{name ?? "A quiet day to keep growing"}</h2>
      {artwork}
      <p className="pause-life-note">One life to read.<br />One thought to carry with you.</p>
    </aside>
    <div className="pause-reading">
      <div className="pause-tabs" role="tablist" aria-label="Choose a moment in your daily pause">
        {steps.map((step, index) => <button key={step} ref={element => { tabs.current[index] = element; }} type="button" role="tab" id={`pause-tab-${index}`} aria-controls={`pause-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => choose(index)} onKeyDown={event => {
          const target = event.key === "ArrowRight" ? (index + 1) % 4 : event.key === "ArrowLeft" ? (index + 3) % 4 : event.key === "Home" ? 0 : event.key === "End" ? 3 : null;
          if (target !== null) { event.preventDefault(); choose(target); }
        }}><span className="pause-step-number" aria-hidden>{completed.includes(index) ? "✓" : index + 1}</span>{step}<span className="sr-only">{completed.includes(index) ? ", marked complete" : ""}</span></button>)}
      </div>
      {steps.map((step, index) => <section key={step} ref={element => { panels.current[index] = element; }} id={`pause-panel-${index}`} role="tabpanel" aria-labelledby={`pause-tab-${index}`} hidden={active !== index} tabIndex={0} className={`pause-panel pause-panel-${index}`}>
        <p className="pause-theme">{index === 0 ? "Begin with the story" : daily.reflection.theme}</p>
        <h3>{headings[index]}</h3>
        {index === 0 ? children : <>
          <p className="pause-original">Original {index === 2 ? "prayer" : "reflection"} by Saint Discovery; not words attributed to {name ?? "a saint"}.</p>
          {index === 1 && <><p className="pause-prompt">{daily.reflection.question}</p>{name && <p>What detail in {name}’s story invites you to think differently about your own day?</p>}</>}
          {index === 2 && <><p className="pause-prompt pause-prayer">{daily.reflection.prayer}</p><p>Take a moment to add your own intention. There is no need to write it here.</p></>}
          {index === 3 && <><p className="pause-prompt">{daily.reflection.action}</p><p>Take this suggestion into your day, at your own pace.</p><Link href="/quiz" prefetch={false} className="pause-quiz-link">Find a saint to get to know next <span aria-hidden>↗</span></Link></>}
        </>}
        <div className="pause-navigation">
          <label><input type="checkbox" checked={completed.includes(index)} onChange={event => setCompleted(current => event.target.checked ? [...current, index] : current.filter(item => item !== index))} />Mark {step.toLowerCase()} complete</label>
          {index < 3 ? <button type="button" onClick={() => choose(index + 1, true)}>Continue to {steps[index + 1].toLowerCase()} <span aria-hidden>→</span></button> : <button type="button" onClick={() => choose(0, true)}>Return to the story</button>}
        </div>
      </section>)}
      <p className="pause-privacy">Optional check-in for this visit. Nothing is saved or sent.</p>
      <p className="pause-status" role="status">{completed.length === 4 ? "Carry your reflection into the rest of your day." : `${completed.length} of 4 moments marked complete. Go at your own pace.`}</p>
    </div>
    <noscript><style>{`.daily-pause .pause-panel[hidden]{display:block!important}.daily-pause .pause-tabs,.daily-pause .pause-navigation,.daily-pause .pause-privacy,.daily-pause .pause-status{display:none}`}</style></noscript>
  </section>;
}
