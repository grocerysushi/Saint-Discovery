import type { Metadata } from "next";
import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import EmailFlowCard from "@/components/EmailFlowCard";
import { verifyToken } from "@/lib/emails/tokens";
import { getSaintBySlug } from "@/lib/saints";
import EmailConfirmationForm from "@/components/EmailConfirmationForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

// GET is read-only by design: it renders a button that POSTs to /api/confirm.
// The subscription is only created on that POST (a real human click), so email
// link scanners / prefetchers that fetch this URL cannot auto-confirm anyone.
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const verified = token ? verifyToken(token, "confirm") : null;
  const saint = verified ? await getSaintBySlug(verified.slug) : null;

  if (!verified) {
    return (
      <EmailFlowCard eyebrow="Saint Discovery" title="This link has expired">
        <p>
          Confirmation links work for seven days. Return to your saved quiz result
          and request a new email. If your result is no longer saved in this browser,
          you can take the quiz again.
        </p>
        <p>
          <Link href="/quiz" className="text-gold hover:text-gold-light underline">
            Return to my result →
          </Link>
        </p>
      </EmailFlowCard>
    );
  }

  return (
    <EmailFlowCard eyebrow="One last step" title="Your novena is one step away">
      <p>
        Confirm your email and we&rsquo;ll send{" "}
        {saint ? (
          <>
            your match — <span className="text-cream">{saintDisplayName(saint)}</span> —
          </>
        ) : (
          "your saint result"
        )}{" "}
        plus a short novena and a reflection.
      </p>
      <EmailConfirmationForm token={token ?? ""} />
      <p className="text-sm text-cream-dark">Opening the email link does not complete confirmation. Press the button above to receive your result and occasional Saint Discovery notes. Unsubscribe anytime.</p>
      <p className="text-cream-dark/60 text-sm">
        If you didn&rsquo;t take the Saint Discovery quiz, you can ignore this
        page — nothing will be sent.
      </p>
    </EmailFlowCard>
  );
}
