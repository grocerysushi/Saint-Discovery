"use client";
import { useEffect, useRef, useState } from "react";
import { PRIVACY_KEY, PRIVACY_DAYS, readPrivacyChoice, clearAnalyticsCookies } from "@/lib/visitor-privacy";

export default function PrivacyChoices() {
  const [open, setOpen] = useState(false);
  const [adult, setAdult] = useState(false);
  const [notice, setNotice] = useState("");
  const [adChoices, setAdChoices] = useState(false);
  const [classroom, setClassroom] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRIVACY_KEY);
      setOpen(!readPrivacyChoice(raw));
      setClassroom(JSON.parse(raw || "null")?.classroom === true);
    }
    catch { setOpen(true); }
    // The existing AdSense tag supplies Google's certified CMP on blog pages.
    // This callback adds a revocation entry point; it does not load a tag.
    const w = window as Window & {
      googlefc?: { callbackQueue?: { push: (entry: object) => unknown }; showRevocationMessage?: () => void };
      __tcfapi?: (command: string, version: number, callback: (data: { gdprApplies?: boolean }, success: boolean) => void) => void;
    };
    let mounted = true;
    w.googlefc ??= {};
    w.googlefc.callbackQueue ??= [] as object[];
    w.googlefc.callbackQueue.push({ CONSENT_API_READY: () => {
      w.__tcfapi?.('addEventListener', 0, (data, success) => { if (mounted && success) setAdChoices(data?.gdprApplies === true); });
    } });
    return () => { mounted = false; };
  }, []);
  function save(analytics: boolean, classroom = false) {
    window["ga-disable-G-C75CMC27YN"] = true;
    clearAnalyticsCookies();
    try {
      localStorage.setItem(PRIVACY_KEY, JSON.stringify({ version: 1, analytics, classroom, expires: Date.now() + PRIVACY_DAYS * 86400000 }));
      // A new document removes already-loaded third-party libraries and applies
      // the new choice before any tag can start. Quiz recovery stays in this tab.
      location.reload();
    } catch {
      setNotice("Your browser could not save this choice. Analytics remains off. You can continue using the site.");
    }
  }
  return <>
    <button type="button" className="text-link" onClick={() => { setOpen(true); requestAnimationFrame(() => heading.current?.focus()); }}>Privacy &amp; cookie choices</button>
    {adChoices && <button type="button" className="text-link" onClick={() => {
      const w = window as Window & { googlefc?: { callbackQueue?: {push: (entry: object) => unknown}; showRevocationMessage?: () => void } };
      w.googlefc?.callbackQueue?.push({ CONSENT_API_READY: () => w.googlefc?.showRevocationMessage?.() });
    }}>Advertising consent choices</button>}
    {open && <section aria-labelledby="privacy-choices-title" className="privacy-choices">
      <h2 id="privacy-choices-title" ref={heading} tabIndex={-1}>Your privacy choices</h2>
      {classroom && <p><strong>Classroom mode is on.</strong> Choosing either Analytics option below exits classroom mode on this browser.</p>}
      <p>Optional Google Analytics stays off unless you allow it. The quiz and resources work without it. Advertising choices on blog pages are handled separately by Google’s consent message.</p>
      <label><input type="checkbox" checked={adult} onChange={e => setAdult(e.target.checked)} /> I am 18 or older and choosing for my own use.</label>
      <div className="privacy-choice-actions">
        <button type="button" className="btn-secondary" onClick={() => save(false)}>Keep analytics off</button>
        <button type="button" className="btn-secondary" disabled={!adult} onClick={() => save(true)}>Allow analytics</button>
        <button type="button" className="btn-secondary" onClick={() => save(false, true)}>Use classroom mode</button>
      </div>
      <p>Classroom mode turns off Analytics, blog ads and email forms on this browser. Use it on shared student devices. Change your choice here anytime. <a href="/privacy">Read our privacy policy</a>.</p>
      {notice && <p role="status">{notice}</p>}
      <button type="button" className="text-link" onClick={() => setOpen(false)}>Close choices</button>
    </section>}
  </>;
}
