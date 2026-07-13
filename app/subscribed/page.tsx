import type { Metadata } from "next";
import Link from "next/link";
import EmailFlowCard from "@/components/EmailFlowCard";
import LeadPing from "@/components/LeadPing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Subscription confirmed",
  robots: { index: false, follow: false },
};

export default async function SubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  if (status === "ok") {
    return (
      <EmailFlowCard eyebrow="You're all set" title="Check your inbox">
        <LeadPing />
        <p>
          Your saint result and a short novena are on their way. If it isn&rsquo;t
          there within a minute, check your spam folder and mark it &ldquo;not
          spam&rdquo; so future notes land safely.
        </p>
        <p>
          <Link
            href="/resources"
            className="text-gold hover:text-gold-light underline"
          >
            Explore more saints →
          </Link>
        </p>
      </EmailFlowCard>
    );
  }

  if (status === "pending") {
    return (
      <EmailFlowCard eyebrow="You're confirmed" title="Almost there">
        <LeadPing />
        <p>
          You&rsquo;re confirmed. We&rsquo;re finishing up — your saint result and
          novena should arrive shortly. If it doesn&rsquo;t come through, open your
          confirmation link again and we&rsquo;ll resend it.
        </p>
        <p>
          <Link
            href="/resources"
            className="text-gold hover:text-gold-light underline"
          >
            Explore more saints →
          </Link>
        </p>
      </EmailFlowCard>
    );
  }

  return (
    <EmailFlowCard eyebrow="Saint Discovery" title="This link is no longer valid">
      <p>
        That confirmation link has expired or wasn&rsquo;t recognized. Retake the
        quiz and we&rsquo;ll send a fresh one.
      </p>
      <p>
        <Link href="/" className="text-gold hover:text-gold-light underline">
          Back to the quiz →
        </Link>
      </p>
    </EmailFlowCard>
  );
}
