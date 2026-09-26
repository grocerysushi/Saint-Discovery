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

const EFFECTIVE_DATE = "September 25, 2026";
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
      <div className="relative z-10 reading-page">
        <header className="mb-10">
          <p className="eyebrow mb-3">
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
            giving us your name. Optional email delivery, analytics, hosting,
            and administration involve the data described below. We add your
            address to the result-email list after you confirm the request.
            You can unsubscribe using the link in an email.
          </p>
        </Section>

        <Section title="What we collect">
          <p>
            <strong className="text-cream">Email address (optional).</strong>{" "}
            If you enter your email on the result screen, we send you a
            confirmation link (double opt-in). Only after you click that link do
            we store your email address together with the saint you matched
            with, so we can send you your result and a short novena. If you
            never confirm, you are not added to that list. Your address is still
            processed to send the confirmation message, and our delivery provider
            may retain delivery records. Confirmation links contain a signed
            token with your email address and saint identifier; keep them private.
          </p>
          <p>
            <strong className="text-cream">Anonymous quiz results.</strong>{" "}
            When you finish the quiz we record the matched saint and the trait
            scores so we can understand which saints people match with. This is
            not linked to your name, email, or any account.
          </p>
          <p>
            <strong className="text-cream">Usage analytics.</strong> We use
            Google Analytics to understand how visitors use the
            site — pages viewed, quiz starts and completions, which saints
            people look up, and general location and device information. These
            reports are used in aggregate, but analytics can use browser
            identifiers and cookies to distinguish visits. You can use
            the Google Analytics opt-out controls described below.
          </p>
        </Section>

        <Section title="How we use your information">
          <p>
            We use your confirmed email address to send you the result and
            novena you requested, and occasional notes from Saint Discovery. We
            do not sell or rent our email list. Service providers process data
            to operate the website and deliver email as described below. Every email
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
              where confirmed email signups, quiz results, blog content, and
              blog administrator account information are stored. Administrative
              access uses authentication; visitors do not need an account.
            </li>
            <li>
              <strong className="text-cream">Google Analytics &amp; Google
              AdSense</strong> — analytics and planned blog advertising.
              AdSense ads are not currently enabled. If enabled, advertisements
              will be confined to the blog. Google and its advertising partners
              may use cookies or identifiers to serve and measure ads, including
              based on visits to this and other websites. See{" "}
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
          </ul>
        </Section>

        <Section title="Remembering your quiz result in this tab">
          <p>After you finish the quiz, we keep the matched saint’s identifier, your selected gender, and the six calculated trait scores in this tab’s session storage. This lets you read biographies and return to your result without repeating the quiz. Individual answers are not included in this saved result, and this feature does not send it to a server or include it in shared links.</p>
          <p>Starting a new quiz clears the saved result. Session storage normally ends when the tab closes, though browser session-restoration settings can retain it. If browser storage is blocked, the result is kept in memory while the page remains open and may be lost on refresh.</p>
        </Section>
        <Section title="Cookies">
          <p>
            Google Analytics can set cookies to measure visits and recognize
            returning browsers. The blog editor uses authentication cookies;
            these are separate from visitor analytics. If blog advertising is
            enabled, advertising providers may also set cookies as described
            above. Your browser settings let you block or delete cookies;
            the quiz does not require advertising or analytics cookies.
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
