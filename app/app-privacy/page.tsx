import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "iPhone App Privacy Policy",
  description: "How the Saint Discovery iPhone app handles quiz progress, the confession tracker, artwork and sharing.",
  alternates: { canonical: "/app-privacy" },
  robots: { index: false, follow: true },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-heading font-semibold text-cream mb-4">{title}</h2>
      <div className="text-cream-dark leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

export default function AppPrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10 reading-page">
        <header className="mb-10">
          <p className="eyebrow mb-3">Saint Discovery</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-4 leading-tight">iPhone App Privacy Policy</h1>
          <p className="text-cream-dark/70 text-sm">Effective October 28, 2026</p>
        </header>
        <Section title="Scope">
          <p>This policy describes the Saint Discovery iPhone app. The <Link href="/privacy" className="underline">Saint Discovery website privacy policy</Link> describes the website, including its optional email features, analytics and advertising choices. If you open the website or another service from the app, that service’s privacy practices apply.</p>
        </Section>
        <Section title="The app and your information">
          <p>You can use the app without an account. The current app does not include advertising, analytics, an email signup, or an upload of quiz answers or results to Saint Discovery. Quiz matching happens on your device.</p>
        </Section>
        <Section title="Quiz progress">
          <p>Outside classroom mode, the app saves your saint gender preference, selected answer identifiers and shuffled answer order in its preferences so that you can resume a quiz. These preferences may be included in device backups. The app calculates your result on your device. Start over or choose <strong>End session &amp; clear quiz</strong> in Settings to remove the saved quiz session.</p>
        </Section>
        <Section title="Confession tracker">
          <p>The optional tracker stores the dates you choose on your device. It does not ask for notes or descriptions. Its data file uses device file protection and is excluded from device backups. You can edit or delete individual dates or clear the history in the tracker. The app does not upload or share the tracker history. Deleting the app removes its local data; data saved in a prior device backup may be restored if you restore that backup, except for the tracker data which the app excludes from backup.</p>
        </Section>
        <Section title="Classroom mode">
          <p>Turning on classroom mode clears the saved quiz session, keeps quiz progress in memory rather than saving it, disables result sharing, and hides the confession tracker. Existing tracker history remains on the device and is not deleted. End the quiz session between learners on a shared device. External websites have their own privacy settings; the app’s classroom setting does not control them.</p>
        </Section>
        <Section title="Artwork and network requests">
          <p>Most app content and included artwork are available offline. <strong>Load artwork from the website</strong> is off by default. If you enable it, the app may request images from Saint Discovery or an artwork’s credited host. The host can receive your IP address and other information normally included in a network request. You can turn this setting off in Settings.</p>
        </Section>
        <Section title="Sharing and external links">
          <p>Sharing is optional. When you use an invitation, the shared message or image can include your matched saint’s name and a link identifying that saint. Quiz answers and trait scores are not included. The app offers the iOS share sheet, copy options and links to services including email, X, Facebook and WhatsApp. The destination you choose handles the information you share under its own practices.</p>
          <p>Daily Mass readings open the USCCB website. Some guides, articles, artwork credits and sources also open websites outside the app. Those sites may process your visit and offer their own privacy choices. Saint Discovery website features such as analytics, advertising and optional email are governed by the separate website policy and its on-site choices; they are not native app features.</p>
        </Section>
        <Section title="Retention and your choices">
          <p>Quiz progress remains in app preferences until you start over, clear the session, turn on classroom mode, or delete the app. Tracker dates remain on the device until you delete individual entries, clear the tracker or delete the app. Device backups can retain app preferences as described above. If you contact us, information in your message is handled through the email services used for that correspondence. For questions or requests about information you send us, contact <a href="mailto:hello@saintdiscoveryquiz.com" className="underline">hello@saintdiscoveryquiz.com</a>.</p>
        </Section>
        <Section title="Changes and contact">
          <p>If the app’s information practices change, we will update this policy. Questions about privacy: <a href="mailto:hello@saintdiscoveryquiz.com" className="underline">hello@saintdiscoveryquiz.com</a>.</p>
        </Section>
      </div>
    </main>
  );
}
