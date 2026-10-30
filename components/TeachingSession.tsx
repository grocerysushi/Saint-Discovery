"use client";

import { useEffect, useRef, useState } from "react";
import { teachingStages, teachingSources } from "@/lib/teaching-session";

function TeachingText({ text }: { text: string }) {
  return text.split(/(\[\d+(?:, \d+)*\])/g).map((part, index) => /^\[\d/.test(part)
    ? <span className="teaching-citation" key={index}>[{part.slice(1, -1).split(", ").map((number, i) => <span key={number}>{i > 0 && ", "}<a href={teachingSources[Number(number) - 1].url} target="_blank" rel="noopener noreferrer" aria-label={`Source ${number}: ${teachingSources[Number(number) - 1].label} (opens in a new tab)`}>{number}</a></span>)}]</span>
    : part);
}

export default function TeachingSession() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const stage = teachingStages[step];

  useEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current;
    const trigger = launcher.current;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    heading.current?.focus();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      trigger?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (dialog.current?.open) heading.current?.focus();
  }, [step]);

  return <>
    <section className="teaching-launch" aria-labelledby="teaching-launch-title">
      <div className="teaching-launch-top"><span>Ready to teach</span><span>45 minutes</span></div>
      <h2 id="teaching-launch-title">One lesson. <br />One step at a time.</h2>
      <p>Keep your place while you lead. Open a focused view of the six-part Confirmation lesson.</p>
      <ol className="teaching-launch-agenda">{teachingStages.map(item => <li key={item.title}><span>{item.title}</span><span>{item.timing.replace(" minutes", " min")}</span></li>)}</ol>
      <button ref={launcher} type="button" onClick={() => { setStep(0); setOpen(true); }}>Start teaching view <span aria-hidden="true">↗</span></button>
      <p className="teaching-launch-note">For a teacher-led session. No student answers are entered or saved here.</p>
      <noscript><p><a href="#lesson">Read the full lesson below</a>. The teaching view needs JavaScript.</p></noscript>
    </section>

    <dialog ref={dialog} className="teaching-dialog" aria-labelledby="teaching-dialog-title" onCancel={event => { event.preventDefault(); setOpen(false); }} onKeyDown={event => {
      if (event.key !== "Tab") return;
      const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
      <div className="teaching-dialog-header"><div><p>Saint Discovery</p><h2 id="teaching-dialog-title">Confirmation lesson</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close teaching view">Close <span aria-hidden="true">×</span></button></div>
      <div className="teaching-workspace">
        <nav className="teaching-agenda" aria-label="Lesson stages">
          <p>Suggested 45-minute plan</p>
          <ol>{teachingStages.map((item, i) => <li key={item.title}><button type="button" aria-current={i === step ? "step" : undefined} onClick={() => setStep(i)}><span className="teaching-stage-number" aria-hidden="true">{i + 1}</span><span>{item.title}<small>{item.timing}</small></span></button></li>)}</ol>
          <a href="/downloads/educators/saint-reflection-worksheet.pdf" target="_blank" rel="noopener noreferrer">Open worksheet PDF ↗</a>
          <a href="/downloads/educators/confirmation-lesson-guide.pdf" target="_blank" rel="noopener noreferrer">Open full lesson PDF ↗</a>
        </nav>
        <section className="teaching-stage" aria-labelledby="teaching-stage-title">
          <div className="teaching-stage-meta"><span>Stage {step + 1} of {teachingStages.length}</span><span>{stage.timing} · suggested timing</span></div>
          <h3 id="teaching-stage-title" ref={heading} tabIndex={-1}>{stage.title}</h3>
          <div className="teaching-stage-text">{stage.body.map(text => <p key={text}><TeachingText text={text} /></p>)}</div>
          <p className="teaching-privacy-note">Personal reflections can stay private. Use paper or discussion; do not enter children’s details on this site.</p>
        </section>
      </div>
      <div className="teaching-stage-controls"><button type="button" disabled={step === 0} onClick={() => setStep(current => current - 1)}>Previous</button><button type="button" className="teaching-next" onClick={() => step === teachingStages.length - 1 ? setOpen(false) : setStep(current => current + 1)}>{step === teachingStages.length - 1 ? "Finish teaching view" : "Next stage"}<span aria-hidden="true">{step === teachingStages.length - 1 ? "✓" : "→"}</span></button></div>
    </dialog>
  </>;
}
