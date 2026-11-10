"use client";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { motion } from "framer-motion";
import { track } from "@/lib/analytics";
import { suggestEmailAddress } from "@/lib/emails/address-suggestion";
import { useTranslationProxy } from "@/lib/use-translation-proxy";
import { SITE_ORIGIN } from "@/lib/site-languages";
import { classroomMode } from "@/lib/visitor-privacy";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLAIN_BUTTON, PLAIN_CARD } from "@/components/shadcnResets";

// Classroom mode lives in localStorage, which does not exist during SSR. Read it
// through the external store so the server snapshot stays false and the setting
// is applied after hydration, without a setState-in-effect cascade.
const subscribeClassroom = () => () => {};
const serverClassroom = () => false;

export default function EmailCapture({ saintSlug, saintName }: { saintSlug: string; saintName: string }) {
  const translationProxy = useTranslationProxy();
  const [email, setEmail] = useState("");
  const [adult, setAdult] = useState(false);
  const classroom = useSyncExternalStore(subscribeClassroom, classroomMode, serverClassroom);
  const [company, setCompany] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [remaining, setRemaining] = useState(0);
  const nextRequestAt = useRef(0);
  const inFlight = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const emailId = useId();
  const suggestion = suggestEmailAddress(email);

  useEffect(() => { if (sent) successRef.current?.focus(); }, [sent]);
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(Math.max(0, Math.ceil((nextRequestAt.current - Date.now()) / 1000))), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function requestConfirmation(resend: boolean) {
    if (translationProxy || classroom || !adult) return;
    if (inFlight.current || Date.now() < nextRequestAt.current) return;
    inFlight.current = true;
    setBusy(true); setMessage("");
    const requestType = resend ? "resend" : "initial";
    track("email_confirmation_request", { request_type: requestType, saint_slug: saintSlug });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, saintSlug, company, adultRequest: true }), signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => ({}));
      const wait = Math.min(3600, Math.max(0, Number(data.retryAfter) || (res.ok ? 60 : 0)));
      nextRequestAt.current = Date.now() + wait * 1000;
      setRemaining(wait);
      if (!res.ok || data.ok !== true || data.status !== "accepted") {
        const failure = typeof data.message === "string" ? data.message : "We couldn't send the email. Please try again.";
        setMessage(failure);
        toast.error(failure);
        track("email_confirmation_error", { request_type: requestType, error_type: res.status === 429 ? "rate_limited" : "send_failed" });
        return;
      }
      setSent(true);
      toast.success(resend ? "Another confirmation email is on its way." : "Confirmation email requested. Check your inbox.");
      track(resend ? "email_confirmation_resend" : "email_confirmation_accepted", { saint_slug: saintSlug });
    } catch {
      nextRequestAt.current = Date.now() + 60000;
      setRemaining(60);
      setMessage("We couldn't confirm the send. Check your inbox first, then try again in a minute.");
      toast.error("We couldn't confirm the send. Check your inbox first, then try again in a minute.");
      track("email_confirmation_error", { request_type: requestType, error_type: "network" });
    } finally { inFlight.current = false; setBusy(false); }
  }

  const waitLabel = remaining >= 60 ? `${Math.ceil(remaining / 60)} min` : `${remaining}s`;
  if (classroom) return (
    <Card className={`${PLAIN_CARD} result-panel`}>
      <h2>Keep your result</h2>
      <p>Email forms are off in classroom mode. You can read your result and prayer guide here without giving an email address.</p>
    </Card>
  );
  if (translationProxy) return (
    <Card className={`${PLAIN_CARD} result-panel`}>
      <h2>Email delivery</h2>
      <p className="text-sm text-cream-dark">Email requests are available on our English site. To request a novena, open the English quiz and complete it there. Your translated result stays in this tab.</p>
      <a href={`${SITE_ORIGIN}/quiz`} data-language-choice="en" target="_blank" rel="noopener noreferrer" className="text-link" onClick={event => { event.preventDefault(); window.open(`${SITE_ORIGIN}/quiz`, "_blank", "noopener,noreferrer"); }}>Open the English quiz ↗</a>
    </Card>
  );
  if (!adult) return (
    <Card className={`${PLAIN_CARD} result-panel`}>
      <h2>Email your result (adults only)</h2>
      <p>You can keep reading without email. If you are a parent, guardian or adult reader, you may request delivery to your own address. Do not enter a child’s email address.</p>
      <Button type="button" variant="quiet" size="cta" onClick={() => setAdult(true)}>I am 18 or older, using my own email</Button>
    </Card>
  );
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
        <Button
          type="button"
          variant="gold"
          size="cta"
          onClick={() => void requestConfirmation(true)}
          disabled={busy || remaining > 0}
          className="disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? "Requesting…" : remaining > 0 ? `Resend in ${waitLabel}` : "Resend confirmation email"}
        </Button>
        <Button
          type="button"
          variant={null}
          size={null}
          className={`${PLAIN_BUTTON} text-link`}
          disabled={busy}
          onClick={() => {
            setSent(false); setMessage("");
            window.requestAnimationFrame(() => emailRef.current?.focus());
          }}
        >
          Change email address
        </Button>
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
        <div>
          <Label htmlFor={emailId} className="block text-sm leading-5 font-normal text-cream select-auto">
            Your email address
          </Label>
          <Input
            ref={emailRef}
            id={emailId}
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-describedby="emailcapture-msg"
            className="block w-full h-auto mt-2 px-4 py-3 text-base md:text-base rounded-lg bg-navy dark:bg-navy border border-navy-lighter text-cream focus:outline-none focus-visible:border-navy-lighter focus-visible:ring-2 focus-visible:ring-gold"
          />
        </div>
        {suggestion && (
          <p className="text-sm text-cream-dark">
            Did you mean{" "}
            <Button
              type="button"
              variant={null}
              size={null}
              className={`${PLAIN_BUTTON} text-link break-all`}
              onClick={() => { setEmail(suggestion); emailRef.current?.focus(); }}
            >
              {suggestion}
            </Button>
            ? Select it to update your address, or keep the address you entered.
          </p>
        )}
        <Button
          type="submit"
          variant="gold"
          size="cta"
          disabled={busy || remaining > 0}
          className="disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? "Sending…" : remaining > 0 ? `Try again in ${waitLabel}` : "Email me my novena"}
        </Button>
      </div>
      <p id="emailcapture-msg" role={message ? "alert" : "status"} className="text-sm text-cream-dark mt-3">{message || (busy ? "Requesting your confirmation email…" : "Only your requested result and novena. No newsletter. Delivery records expire after seven days and are removed by daily cleanup.")}</p>
    </motion.form>
  );
}
