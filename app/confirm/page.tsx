import type { Metadata } from "next";
import Link from "next/link";
import EmailFlowCard from "@/components/EmailFlowCard";
import { verifyToken } from "@/lib/emails/tokens";
import { getSaintBySlug } from "@/lib/saints";

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
          Confirmation links are valid for seven days. Retake the quiz to get a
          fresh one.
        </p>
        <p>
          <Link href="/" className="text-gold hover:text-gold-light underline">
            Back to the quiz →
          </Link>
        </p>
      </EmailFlowCard>
    );
  }

  return (
    <EmailFlowCard eyebrow="One last step" title="Confirm your subscription">
      <p>
        Confirm your email and we&rsquo;ll send{" "}
        {saint ? (
          <>
            your match — <span className="text-cream">St. {saint.name}</span> —
          </>
        ) : (
          "your saint result"
        )}{" "}
        plus a short novena and a reflection.
      </p>
      <form method="POST" action="/api/confirm" className="pt-2">
        <input type="hidden" name="token" defaultValue={token ?? ""} />
        <button
          type="submit"
          className="inline-block px-8 py-3 bg-gold text-navy font-semibold rounded-full
                     hover:bg-gold-light transition-colors cursor-pointer"
        >
          Confirm my email
        </button>
      </form>
      <p className="text-cream-dark/60 text-sm">
        If you didn&rsquo;t take the Saint Discovery quiz, you can ignore this
        page — nothing will be sent.
      </p>
    </EmailFlowCard>
  );
}
