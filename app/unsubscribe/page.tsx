import type { Metadata } from "next";
import EmailFlowCard from "@/components/EmailFlowCard";
import { verifyToken } from "@/lib/emails/tokens";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// Read-only page: unsubscribing happens on the POST to /api/unsubscribe (button
// click or the mail provider's one-click), never on this GET.
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string }>;
}) {
  const { token, status } = await searchParams;
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

  const retry = status === "error";

  return (
    <EmailFlowCard
      eyebrow="Saint Discovery"
      title={retry ? "We couldn't complete your unsubscribe" : "Unsubscribe"}
    >
      {retry ? (
        <p role="alert">
          Something went wrong while removing your subscription. Please try again
          below. If it still fails, reply to any of our emails and we&rsquo;ll
          remove you.
        </p>
      ) : (
        <p>Stop receiving emails from Saint Discovery?</p>
      )}
      <form
        method="POST"
        action="/api/unsubscribe"
        className="pt-2"
      >
        <input type="hidden" name="token" defaultValue={token ?? ""} />
        <button
          type="submit"
          className="inline-block px-8 py-3 border border-gold/40 text-gold rounded-full
                     hover:bg-gold/10 transition-colors cursor-pointer"
        >
          {retry ? "Try unsubscribing again" : "Unsubscribe me"}
        </button>
      </form>
    </EmailFlowCard>
  );
}
