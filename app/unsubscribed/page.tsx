import type { Metadata } from "next";
import Link from "next/link";
import EmailFlowCard from "@/components/EmailFlowCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Unsubscribed",
  robots: { index: false, follow: false },
};

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <EmailFlowCard
      eyebrow="Saint Discovery"
      title={status === "ok" ? "You've been unsubscribed" : "Request received"}
    >
      <p>
        {status === "ok"
          ? "You won't receive any more emails from Saint Discovery. You're always welcome back."
          : "If that link was valid, you've been removed. You can also reply to any email and we'll take care of it."}
      </p>
      <p>
        <Link href="/" className="text-gold hover:text-gold-light underline">
          Back to Saint Discovery →
        </Link>
      </p>
    </EmailFlowCard>
  );
}
