import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Saint Discovery handles your data: what we collect, how the email list works, the services we rely on, and how to unsubscribe or request deletion.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Saint Discovery",
    description:
      "How Saint Discovery handles your data and how to unsubscribe or request deletion.",
    url: absoluteUrl("/privacy"),
    siteName: siteConfig.name,
    type: "website",
  },
};

const EFFECTIVE_DATE = "July 19, 2026";
const CONTACT_EMAIL = "hello@saintdiscoveryquiz.com";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-heading font-semibold text-cream mb-4">
        {title}
      </h2>
      <div className="text-cream-dark leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <header className="mb-10">
          <p className="text-gold tracking-[0.25em] uppercase text-xs mb-3">
            Saint Discovery
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-cream-dark/70 text-sm">
            Effective {EFFECTIVE_DATE}
          </p>
        </header>

        <Section title="The short version">
          <p>
            Saint Discovery is a free Catholic saint quiz and directory. You can
            take the quiz and browse every page without creating an account or
            giving us your name. The only personal information we ever store is
            an email address — and only if you ask us to email you your result
            and confirm that request from your inbox. You can unsubscribe with
            one click at any time, which deletes your address from our list.
          </p>
        </Section>

        <Section title="What we collect">
          <p>
            <strong className="text-cream">Email address (optional).</strong>{" "}
            If you enter your email on the result screen, we send you a
            confirmation link (double opt-in). Only after you click that link do
            we store your email address together with the saint you matched
            with, so we can send you your result and a short novena. If you
            never confirm, nothing is stored.
          </p>
          <p>
            <strong className="text-cream">Anonymous quiz results.</strong>{" "}
            When you finish the quiz we record the matched saint and the trait
            scores so we can understand which saints people match with. This is
            not linked to your name, email, or any account.
          </p>
          <p>
            <strong className="text-cream">Usage analytics.</strong> We use
            Google Analytics and PostHog to understand how visitors use the
            site — pages viewed, quiz starts and completions, which saints
            people look up, and general location and device information. This
            data is aggregated and does not identify you to us. You can opt
            out of PostHog tracking by enabling &ldquo;Do Not Track&rdquo; in
            your browser or by using the opt-out controls described below.
          </p>
        </Section>

        <Section title="How we use your information">
          <p>
            We use your confirmed email address to send you the result and
            novena you requested, and occasional notes from Saint Discovery. We
            do not sell, rent, or share our email list with anyone. Every email
            we send includes an unsubscribe link; unsubscribing removes your
            address from our list.
          </p>
        </Section>

        <Section title="Services we rely on">
          <p>
            Like most small websites, we use a few trusted providers to run
            Saint Discovery. Each receives only what it needs to do its job:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-cream">Vercel</strong> — hosts the
              website and processes requests (including IP addresses, as any
              web host does).
            </li>
            <li>
              <strong className="text-cream">Resend</strong> — delivers our
              emails (processes your email address when we send to you).
            </li>
            <li>
              <strong className="text-cream">InsForge</strong> — the database
              where confirmed email signups and anonymous quiz results are
              stored.
            </li>
            <li>
              <strong className="text-cream">Google Analytics &amp; Google
              Ads</strong> — analytics and advertising. Google may set cookies
              and use identifiers as described in{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light underline"
              >
                Google&rsquo;s privacy policy
              </a>
              . You can opt out of Google Analytics with the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light underline"
              >
                browser opt-out add-on
              </a>{" "}
              and manage ad personalization at{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light underline"
              >
                adssettings.google.com
              </a>
              .
            </li>
            <li>
              <strong className="text-cream">PostHog</strong> — product
              analytics. PostHog (us.posthog.com) receives the page URL,
              referrer, user agent, and the custom events we trigger from the
              site (e.g. <code className="text-cream/80">quiz_start</code>,{" "}
              <code className="text-cream/80">quiz_complete</code>,{" "}
              <code className="text-cream/80">saint_viewed</code>,{" "}
              <code className="text-cream/80">email_signup</code>). PostHog
              sets a first-party cookie to recognize repeat visitors; their
              data handling is described in{" "}
              <a
                href="https://posthog.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light underline"
              >
                PostHog&rsquo;s privacy policy
              </a>
              . We route events through our own domain (<code className="text-cream/80">/ingest</code>)
              so the data is not sent directly to PostHog from your browser. You
              can opt out by enabling &ldquo;Do Not Track&rdquo; in your
              browser, or by using the{" "}
              <a
                href="https://posthog.com/docs/privacy/opt-out-cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light underline"
              >
                PostHog opt-out
              </a>{" "}
              instructions.
            </li>
          </ul>
        </Section>

        <Section title="Cookies">
          <p>
            Saint Discovery itself does not set tracking cookies. Google
            Analytics, Google Ads, and PostHog set first-party cookies to
            measure visits and recognize returning visitors, as described
            above. Your browser settings let you block or delete cookies at
            any time; the quiz works fine without them.
          </p>
        </Section>

        <Section title="Your choices and rights">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-cream">Unsubscribe</strong> — every email
              includes an unsubscribe link that removes your address from our
              list immediately.
            </li>
            <li>
              <strong className="text-cream">Deletion or access</strong> —
              email us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-gold hover:text-gold-light underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              and we will delete or share whatever we hold about your address.
            </li>
          </ul>
          <p>
            Depending on where you live (for example the EU/EEA, UK, or
            California), you may have additional legal rights to access,
            correct, or delete personal information. We honor those requests
            regardless of where you live — just email us.
          </p>
        </Section>

        <Section title="Children">
          <p>
            Saint Discovery is a general-audience site and is not directed at
            children under 13. We do not knowingly collect personal information
            from children; if you believe a child has given us their email
            address, contact us and we will delete it.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we change how we handle personal information, we will update
            this page and its effective date. Significant changes to how we use
            email addresses will be announced to the list before they take
            effect.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy or your data:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-gold hover:text-gold-light underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <p className="pt-4 border-t border-navy-lighter">
          <Link href="/" className="text-gold hover:text-gold-light underline">
            ← Back to the quiz
          </Link>
        </p>
      </div>
    </main>
  );
}
