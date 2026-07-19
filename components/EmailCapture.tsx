"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { track } from "@/lib/analytics";
import posthog from "posthog-js";

// Double opt-in email capture shown on the result screen. Posts to /api/subscribe
// (JSON); the server sends a confirmation email and writes nothing until the user
// confirms. We never echo the entered address back into the page.
export default function EmailCapture({
  saintSlug,
  saintName,
}: {
  saintSlug: string;
  saintName: string;
}) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot — real users never see it
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const successRef = useRef<HTMLDivElement>(null);

  // Move focus to the confirmation once it replaces the form, so keyboard/screen-
  // reader users aren't stranded on a control that no longer exists.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "submitting" || status === "success") return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, saintSlug, company }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      track("email_signup", { saint_slug: saintSlug });
      posthog.capture("email_signup", { saint_slug: saintSlug });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-navy-light rounded-2xl p-6 mb-8 text-center outline-none
                   focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2
                   focus-visible:ring-offset-navy"
      >
        <p className="text-2xl mb-2" aria-hidden>
          📬
        </p>
        <p className="text-cream font-heading text-lg mb-1">Check your inbox</p>
        <p className="text-cream-dark text-sm leading-relaxed">
          We just sent a confirmation link. Click it and your result plus a short
          novena to St. {saintName} will be on the way.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      aria-busy={status === "submitting"}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-navy-light rounded-2xl p-6 mb-8 text-left"
    >
      <p className="text-cream font-heading text-lg mb-1 text-center">
        Take St. {saintName} with you
      </p>
      <p className="text-cream-dark text-sm mb-4 text-center leading-relaxed">
        Get your result and a short novena &amp; reflection by email.
      </p>

      {/* Honeypot: off-screen, skipped by humans, tempting to bots. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label>
          Company
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Your email address"
          aria-invalid={status === "error"}
          aria-describedby="emailcapture-msg"
          className="flex-1 min-w-0 px-4 py-3 rounded-full bg-navy border border-navy-lighter
                     text-cream placeholder:text-cream-dark/60 transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-gold
                     focus-visible:ring-offset-2 focus-visible:ring-offset-navy-light"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="px-6 py-3 bg-gold text-navy font-semibold rounded-full whitespace-nowrap
                     hover:bg-gold-light transition-colors cursor-pointer
                     disabled:opacity-60 disabled:cursor-not-allowed
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light
                     focus-visible:ring-offset-2 focus-visible:ring-offset-navy-light"
        >
          {status === "submitting" ? "Sending…" : "Email me my novena"}
        </button>
      </div>

      {/* Single live region: neutral helper by default, an alert on error. */}
      {status === "error" ? (
        <p
          id="emailcapture-msg"
          role="alert"
          className="text-red-300 text-sm mt-3 text-center"
        >
          <span aria-hidden>⚠ </span>Something went wrong — please try again.
        </p>
      ) : (
        <p
          id="emailcapture-msg"
          role="status"
          aria-live="polite"
          className="text-cream-dark/70 text-xs mt-3 text-center"
        >
          {status === "submitting"
            ? "Sending your confirmation link…"
            : "Double opt-in · no spam · unsubscribe anytime"}
        </p>
      )}
    </motion.form>
  );
}
