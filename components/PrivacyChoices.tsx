"use client";
import { useRef, useState } from "react";
import { PRIVACY_KEY, PRIVACY_DAYS, analyticsAllowed, classroomMode, clearAnalyticsCookies } from "@/lib/visitor-privacy";
import { Button } from "@/components/ui/button";
import { PLAIN_BUTTON } from "@/components/shadcnResets";
import "./privacy-settings.css";

export default function PrivacyChoices() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [classroom, setClassroom] = useState(false);
  const [notice, setNotice] = useState("");
  function open() {
    setEnabled(analyticsAllowed()); setClassroom(classroomMode()); setNotice("");
    dialog.current?.showModal();
  }
  function save(analytics: boolean, classroomChoice = classroom) {
    window["ga-disable-G-C75CMC27YN"] = true;
    clearAnalyticsCookies();
    try {
      localStorage.setItem(PRIVACY_KEY, JSON.stringify({ version: 1, analytics, classroom: classroomChoice, expires: Date.now() + PRIVACY_DAYS * 86400000 }));
      location.reload();
    } catch {
      // Stays inline: a toast would render beneath this modal dialog's top layer.
      setNotice("Your browser could not save this choice. Analytics is stopped in this page. Browser privacy settings can also block it.");
    }
  }
  return <>
    <Button type="button" variant={null} size={null} className={`${PLAIN_BUTTON} text-link`} onClick={open}>
      Privacy &amp; cookie choices
    </Button>
    <dialog ref={dialog} className="privacy-settings-dialog" aria-labelledby="privacy-choices-title">
      <h2 id="privacy-choices-title">Your privacy choices</h2>
      <p>Google Analytics runs automatically on our public site to measure visits and quiz activity. It uses cookies. Advertising and Google Signals are off.</p>
      <p role="status">{classroom ? "Classroom mode is on. Analytics and email forms are off." : enabled ? "Analytics is enabled in your browser preferences." : "Analytics is off in your browser preferences."}</p>
      <p>You can turn analytics off here. We also respect Do Not Track, Global Privacy Control and previous explicit analytics refusals. Local previews and admin pages are never tracked.</p>
      <div className="privacy-settings-actions">
        <Button type="button" variant="quiet" size="cta" onClick={() => save(false)}>
          Turn analytics off
        </Button>
        <Button type="button" variant="quiet" size="cta" onClick={() => save(true, false)}>
          Enable analytics
        </Button>
        <Button type="button" variant="quiet" size="cta" onClick={() => save(false, true)}>
          Use classroom mode
        </Button>
      </div>
      <p>Enabling analytics exits classroom mode. Browser privacy signals still take priority. These preferences stay on this device until you change them or clear browser storage.</p>
      {notice && <p role="alert">{notice}</p>}
      <p><a href="/privacy" className="text-link">Read the privacy policy</a></p>
      <Button type="button" variant="gold" size="cta" onClick={() => dialog.current?.close()}>
        Done
      </Button>
    </dialog>
  </>;
}
