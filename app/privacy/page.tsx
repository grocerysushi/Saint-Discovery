import type { Metadata } from "next";
import Link from "next/link";
import { socialMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Saint Discovery handles quiz data, optional email delivery, cookie choices and deletion requests.",
  alternates: { canonical: "/privacy" },
  ...socialMetadata("Privacy Policy | Saint Discovery", "How Saint Discovery handles your data and how to unsubscribe or request deletion.", "/privacy"),
};

const EFFECTIVE_DATE = "October 26, 2026";
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
            giving us your name. Optional email delivery, analytics, advertising,
            hosting, and administration involve the data described below. We keep a short-lived
            delivery record after you confirm an email request. There is no newsletter signup.
            You can unsubscribe using the link in an email.
          </p>
        </Section>

        <Section title="What we collect">
          <p>
            <strong className="text-cream">Email address (optional).</strong>{" "}
            If you enter your email on the result screen, we send you a
            confirmation link. Only after you open it and press the confirmation button on our website do
            we store your email address and a timestamp to support delivery and retries.
            We do not store your matched saint or trait scores in that delivery record. If you
            never confirm, no delivery record is added to our database. Your address is still
            processed to send the confirmation message, and our delivery provider
            may retain delivery records. Confirmation links contain a signed
            token with your email address and saint identifier; keep them private.
          </p>
          <p>
            <strong className="text-cream">Quiz results.</strong>{" "}
            New quiz results and trait scores are not written to our database. They stay
            in your browser as described below. Historical result records collected before
            October 26, 2026 remain restricted to administrators; this change did not erase them.
            If you allow Analytics, a quiz-completion event can include the matched saint identifier,
            but not your answers, gender, trait scores or email address.
          </p>
          <p>
            <strong className="text-cream">Usage analytics.</strong> We use
            Google Analytics only after you explicitly allow it to understand how visitors use the
            site — pages viewed, quiz starts and completions, which saints
            people look up, and general location and device information. These
            reports are used in aggregate, but analytics can use browser
            identifiers and cookies to distinguish visits. Use “Privacy & cookie choices”
            in the footer to refuse or withdraw permission. We do not load Analytics before
            permission or send earlier events later. Advertising personalization signals and
            Google Signals are disabled in our Analytics configuration.
          </p>
        </Section>

        <Section title="How we use your information">
          <p>
            We use your confirmed email address to send you the result and
            novena you requested. We do not send occasional notes or newsletters, and
            do not sell or rent email addresses. Service providers process data
            to operate the website and deliver email as described below. Result emails
            include a deletion/unsubscribe link. Confirmation emails are sent only in response
            to a request; ignoring them does not create a database delivery record.
          </p>
        </Section>

        <Section title="Email retention">
          <p>Confirmed delivery records contain only an email address, record identifier and timestamp. They expire seven days after confirmation and are automatically deleted by a daily cleanup job, within eight days in normal operation. Retrying within that window does not extend it. A new confirmed request after expiry starts a new delivery window.</p>
          <p>For abuse prevention we keep keyed, non-plaintext recipient hashes, message purpose and send-attempt times for a rolling 24 hours. Cleanup runs on new send attempts and daily even when no one requests email; these records are removed within 48 hours in normal operation. We do not keep recipient location data. Temporary IP-based rate limits are held in server memory.</p>
          <p>Confirmation links expire after seven days. They contain signed, readable email and saint data, so do not share them. Our database cleanup does not erase messages already in your mailbox or provider logs/backups. Resend processes recipient and message data for delivery under its own retention practices; contact us about provider-held data as well. We do not promise immediate deletion from every provider backup.</p>
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
              where temporary email delivery records, hashed send-limit records, historical quiz records, blog content, and
              blog administrator account information are stored. Administrative
              access uses authentication; visitors do not need an account.
            </li>
            <li>
              <strong className="text-cream">Google Analytics &amp; Google
              AdSense</strong> — usage analytics and advertisements that may
              appear on this site. Google and its advertising partners
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

        <Section title="Optional website translation">
          <p>The language button opens a public page in Google Translate, a separate Google service. Google receives the public page address and processes the content to translate it. No translation request is made just by opening our language menu. Translations are automatic and may contain errors; English is our original editorial text.</p>
          <p>Language-menu links omit query strings and fragments and are unavailable on administrator, subscription and email-confirmation pages. Searches and directory filters used within the translated view are processed by Google with that page. Email signup is unavailable in the translated view. You can return to the English site using the language menu. The translated view remembers the chosen language in that tab’s session storage so public-page navigation can keep the same language. Google’s service is subject to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Google’s privacy policy</a>.</p>
        </Section>

        <Section title="Remembering your quiz in this tab">
          <p>While you answer, we keep your selected gender, answer-option identifiers, and shuffled option order in this tab’s session storage so you can resume after a refresh. We rebuild your scores from the current quiz content when restoring an attempt. This unfinished progress stays in your browser and is not sent to a server or included in shared links. Choosing Start over or completing the quiz clears it.</p>
          <p>After you finish the quiz, we keep the matched saint’s identifier, your selected gender, and the six calculated trait scores in this tab’s session storage. This lets you read biographies and return to your result without repeating the quiz. Individual answers are not included in this saved result, and this feature does not send it to a server or include it in shared links.</p>
          <p>Starting a new quiz clears the saved result and unfinished progress. Session storage normally ends when the tab closes, though browser session-restoration settings can retain it. If browser storage is blocked, progress and results are kept in memory while the page remains open and may be lost on refresh.</p>
        </Section>
        <Section title="Cookies">
          <p>Your Analytics choice lasts up to 180 days. Analytics defaults to off, including when the preference is missing, invalid or expired. Classroom mode stays on until you change it or clear browser storage. Refusing or withdrawing permission clears the Analytics cookies we can access and reloads the page to stop the loaded tag. Essential quiz recovery, confirmation/retry cookies and administrator authentication are separate from optional analytics.</p>
          <p>
            Google Analytics can set cookies to measure visits and recognize
            returning browsers. The blog editor uses authentication cookies;
            these are separate from visitor analytics. Advertising providers
            may also set cookies as described
            above. Google’s separate regional advertising message provides consent and refusal options and, where applicable, privacy/opt-out choices. Our Analytics control does not replace that message. Your browser settings let you block or delete cookies;
            the quiz does not require advertising or analytics cookies.
          </p>
        </Section>

        <Section title="Your choices and rights">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-cream">Delete a delivery record</strong> — use the
              unsubscribe link in your result email and confirm on the website. It removes
              the matching address from our delivery table. This does not cancel an email already sent.
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
            Our Confirmation and classroom resources may be used with young people. We do
            not treat an age disclaimer as proof that children’s privacy laws do not apply.
            Email delivery is offered only to adults using their own addresses; do not submit a child’s address.
            We ask for an adult declaration, not a birth date or identity document. This declaration
            is not verified parental consent.
          </p>
          <p>For classroom or shared-device use, enable classroom mode in the footer before students browse. It turns off Analytics, blog ads and email forms on that browser. Printed worksheets require no signup and do not send written answers to us. Hosting and security services still process web requests. Adults should supervise use, keep children’s personal reflections offline and avoid third-party translation links for children.</p>
          <p>If you believe we hold a child’s personal information, contact {CONTACT_EMAIL} so we can investigate and delete it. We do not operate a verified parental-consent program. Schools and families should use the offline resources for children under 13 while we review the audience and data practices.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we change how we handle personal information, we will update
            this page and its effective date. Any future newsletter would require a separate
            opt-in; requesting a result does not sign you up for future marketing.
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
          <Link prefetch={false} href="/" className="text-gold hover:text-gold-light underline">
            ← Back to the quiz
          </Link>
        </p>
      </div>
    </main>
  );
}
