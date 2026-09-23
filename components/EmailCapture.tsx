"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { track } from "@/lib/analytics";
import { suggestEmailAddress } from "@/lib/emails/address-suggestion";

export default function EmailCapture({ saintSlug, saintName }: { saintSlug: string; saintName: string }) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [remaining, setRemaining] = useState(0);
  const nextRequestAt = useRef(0);
  const inFlight = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const suggestion = suggestEmailAddress(email);

  useEffect(() => { if (sent) successRef.current?.focus(); }, [sent]);
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(Math.max(0, Math.ceil((nextRequestAt.current - Date.now()) / 1000))), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function requestConfirmation(resend: boolean) {
    if (inFlight.current || Date.now() < nextRequestAt.current) return;
    inFlight.current = true;
    setBusy(true); setMessage("");
    const requestType = resend ? "resend" : "initial";
    track("email_confirmation_request", { request_type: requestType, saint_slug: saintSlug });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, saintSlug, company }), signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => ({}));
      const wait = Math.min(3600, Math.max(0, Number(data.retryAfter) || (res.ok ? 60 : 0)));
      nextRequestAt.current = Date.now() + wait * 1000;
      setRemaining(wait);
      if (!res.ok || data.ok !== true || data.status !== "accepted") {
        setMessage(typeof data.message === "string" ? data.message : "We couldn't send the email. Please try again.");
        track("email_confirmation_error", { request_type: requestType, error_type: res.status === 429 ? "rate_limited" : "send_failed" });
        return;
      }
      setSent(true);
      track(resend ? "email_confirmation_resend" : "email_signup", { saint_slug: saintSlug });
    } catch {
      nextRequestAt.current = Date.now() + 60000;
      setRemaining(60);
      setMessage("We couldn't confirm the send. Check your inbox first, then try again in a minute.");
      track("email_confirmation_error", { request_type: requestType, error_type: "network" });
    } finally { inFlight.current = false; setBusy(false); }
  }

  const waitLabel = remaining >= 60 ? `${Math.ceil(remaining / 60)} min` : `${remaining}s`;
  if (sent) return (
    <motion.div ref={successRef} tabIndex={-1} className="result-panel outline-none focus-visible:ring-2 focus-visible:ring-gold" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <p className="eyebrow">Your next step</p>
      <h2>Confirm from your inbox</h2>
      <p className="text-sm text-cream-dark break-words">Confirmation requested for <strong className="text-cream">{email.trim()}</strong>.</p>
      <ol className="list-decimal pl-5 space-y-3 text-sm text-cream-dark my-5">
        <li>Find <strong className="text-cream">“Confirm your Saint Discovery email”</strong> from Saint Discovery.</li>
        <li>Open the email and choose <strong className="text-cream">“Continue to confirmation.”</strong></li>
        <li>On our website, press <strong className="text-cream">“Confirm &amp; send my novena.”</strong> Then we’ll email your result and prayer guide.</li>
      </ol>
      <p className="text-sm text-cream-dark">Give it a minute, then check Spam, Junk, or Promotions. Search for <span className="break-all">hello@saintdiscoveryquiz.com</span>. Links work for seven days.</p>
      <div className="flex flex-col items-start gap-3 mt-5">
        <button type="button" onClick={() => void requestConfirmation(true)} disabled={busy || remaining > 0} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
          {busy ? "Requesting…" : remaining > 0 ? `Resend in ${waitLabel}` : "Resend confirmation email"}
        </button>
        <button type="button" className="text-link" disabled={busy} onClick={() => {
          setSent(false); setMessage("");
          window.requestAnimationFrame(() => emailRef.current?.focus());
        }}>Change email address</button>
      </div>
      <p role="status" aria-live="polite" className="text-sm text-cream-dark mt-3">{busy ? "Requesting another confirmation email…" : message}</p>
      <p className="text-xs text-cream-dark mt-4">Still stuck? <a className="underline" href="mailto:hello@saintdiscoveryquiz.com">Contact us</a>. You can keep exploring your result while you wait.</p>
    </motion.div>
  );

  return (
    <motion.form onSubmit={(event: FormEvent) => { event.preventDefault(); void requestConfirmation(false); }} aria-busy={busy} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="result-panel">
      <h2 className="!text-lg">Take {saintName} with you</h2>
      <p className="text-sm text-cream-dark mb-4">Get your result and a short novena by email. We’ll send a link to confirm on our website first.</p>
      <div aria-hidden style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" value={company} onChange={e => setCompany(e.target.value)} /></label>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-sm text-cream">Your email address
          <input ref={emailRef} type="email" name="email" required autoComplete="email" inputMode="email" spellCheck={false} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" aria-describedby="emailcapture-msg" className="block w-full mt-2 px-4 py-3 rounded-lg bg-navy border border-navy-lighter text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-gold" />
        </label>
        {suggestion && <p className="text-sm text-cream-dark">Did you mean <button type="button" className="text-link break-all" onClick={() => { setEmail(suggestion); emailRef.current?.focus(); }}>{suggestion}</button>? Select it to update your address, or keep the address you entered.</p>}
        <button type="submit" disabled={busy || remaining > 0} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">{busy ? "Sending…" : remaining > 0 ? `Try again in ${waitLabel}` : "Email me my novena"}</button>
      </div>
      <p id="emailcapture-msg" role={message ? "alert" : "status"} className="text-sm text-cream-dark mt-3">{message || (busy ? "Requesting your confirmation email…" : "Your novena and occasional Saint Discovery notes. Unsubscribe anytime.")}</p>
    </motion.form>
  );
}
