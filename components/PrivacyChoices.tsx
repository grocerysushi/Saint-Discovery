"use client";
import { useEffect, useRef, useState } from "react";
import { PRIVACY_KEY, PRIVACY_DAYS, readPrivacyChoice, clearAnalyticsCookies } from "@/lib/visitor-privacy";

export default function PrivacyChoices() {
  const [view, setView] = useState<"banner" | "allow" | "settings" | null>(null);
  const [adult, setAdult] = useState(false);
  const [notice, setNotice] = useState("");
  const [classroom, setClassroom] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const footerButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Read the browser-only preference after hydration. Analytics remains
    // disabled independently of whether this panel has rendered yet.
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(PRIVACY_KEY);
        if (!readPrivacyChoice(raw) && sessionStorage.getItem("sd:privacy-dismissed") !== "1") setView("banner");
        setClassroom(JSON.parse(raw || "null")?.classroom === true);
      }
      catch { setView("banner"); }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  function show(next: "allow" | "settings") {
    setAdult(false);
    setNotice("");
    setView(next);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function close() {
    // Dismissal is only remembered in this tab and never grants consent.
    try { sessionStorage.setItem("sd:privacy-dismissed", "1"); } catch {}
    setView(null);
    footerButton.current?.focus({ preventScroll: true });
  }
  function save(analytics: boolean, classroom = false) {
    if (analytics && !adult) return;
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
    <button ref={footerButton} type="button" className="text-link" onClick={() => show("settings")}>Privacy &amp; cookie choices</button>
    {view && <section aria-labelledby="privacy-choices-title" className={`privacy-choices${view === "banner" ? " privacy-banner" : ""}`} onKeyDown={event => { if (event.key === "Escape") close(); }}>
      {view === "banner" ? <>
        <button type="button" className="privacy-dismiss" aria-label="Dismiss banner; keep analytics off" onClick={close}>×</button>
        <h2 id="privacy-choices-title">Optional analytics</h2>
        <p>Help us understand how the site is used. The quiz works either way.</p>
        <div className="privacy-banner-actions">
          <button type="button" className="btn-secondary" onClick={() => save(false)}>Keep off</button>
          <button type="button" className="btn-secondary" onClick={() => show("allow")}>Allow analytics</button>
          <button type="button" className="text-link" onClick={() => show("settings")}>Settings</button>
        </div>
      </> : <>
      <h2 id="privacy-choices-title" ref={heading} tabIndex={-1}>{view === "allow" ? "Allow optional analytics?" : "Your privacy choices"}</h2>
      {classroom && <p><strong>Classroom mode is on.</strong> Choosing either Analytics option below exits classroom mode on this browser.</p>}
      <p>Google Analytics uses cookies to measure visits and quiz activity. It stays off unless you allow it. The quiz works either way. This site has no ads.</p>
      <label><input type="checkbox" checked={adult} onChange={e => setAdult(e.target.checked)} /> I am 18 or older and choosing for my own use.</label>
      <div className="privacy-choice-actions">
        <button type="button" className="btn-secondary" onClick={() => save(false)}>Keep analytics off</button>
        <button type="button" className="btn-secondary" disabled={!adult} onClick={() => save(true)}>Allow analytics</button>
        {view === "settings" && <button type="button" className="btn-secondary" onClick={() => save(false, true)}>Use classroom mode</button>}
      </div>
      {view === "settings" ? <details className="privacy-classroom-details"><summary>What is classroom mode?</summary><p>On this browser, classroom mode turns off Analytics and email forms. Use it on shared student devices. You can change your choice anytime.</p></details> : <p><button type="button" className="text-link" onClick={() => show("settings")}>Classroom mode &amp; settings</button></p>}
      <p><a href="/privacy">Read our privacy policy</a>.</p>
      </>}
      {notice && <p role="status">{notice}</p>}
      {view !== "banner" && <button type="button" className="text-link" onClick={close}>Close choices</button>}
    </section>}
  </>;
}
