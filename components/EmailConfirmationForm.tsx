"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

export default function EmailConfirmationForm({ token, retry = false }: { token: string; retry?: boolean }) {
  const [pending, setPending] = useState(false);
  const submitted = useRef(false);
  const viewed = useRef(false);
  useEffect(() => {
    if (!viewed.current && !retry) { viewed.current = true; track("email_confirmation_view"); }
    const restore = () => { submitted.current = false; setPending(false); };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, [retry]);
  return <form method="POST" action="/api/confirm" className="pt-2" aria-busy={pending} onSubmit={event => {
    if (submitted.current) { event.preventDefault(); return; }
    submitted.current = true; setPending(true);
    track(retry ? "email_result_resend" : "email_confirmation_submit");
  }}>
    <input type="hidden" name="token" value={token} />
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">{pending ? "Please wait…" : retry ? "Try sending my result again" : "Confirm & send my novena"}</button>
    {pending && <p role="status" className="text-sm text-cream-dark mt-3">We’re processing your request. Please keep this page open.</p>}
  </form>;
}
