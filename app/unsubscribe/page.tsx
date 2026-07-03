import type { Metadata } from "next";
import EmailFlowCard from "@/components/EmailFlowCard";
import { verifyToken } from "@/lib/emails/tokens";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

// Read-only page: unsubscribing happens on the POST to /api/unsubscribe (button
// click or the mail provider's one-click), never on this GET.
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const verified = token ? verifyToken(token, "unsub") : null;

  if (!verified) {
    return (
      <EmailFlowCard eyebrow="Saint Discovery" title="Link not recognized">
        <p>
          This unsubscribe link is invalid or has expired. You can also reply to
          any of our emails and we&rsquo;ll remove you.
        </p>
      </EmailFlowCard>
    );
  }

  return (
    <EmailFlowCard eyebrow="Saint Discovery" title="Unsubscribe">
      <p>Stop receiving emails from Saint Discovery?</p>
      <form
        method="POST"
        action={`/api/unsubscribe?token=${encodeURIComponent(token ?? "")}`}
        className="pt-2"
      >
        <input type="hidden" name="token" defaultValue={token ?? ""} />
        <button
          type="submit"
          className="inline-block px-8 py-3 border border-gold/40 text-gold rounded-full
                     hover:bg-gold/10 transition-colors cursor-pointer"
        >
          Unsubscribe me
        </button>
      </form>
    </EmailFlowCard>
  );
}
