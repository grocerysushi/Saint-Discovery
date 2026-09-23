import type { Metadata } from "next";
import Link from "next/link";
import EmailFlowCard from "@/components/EmailFlowCard";
import LeadPing from "@/components/LeadPing";
import { cookies } from "next/headers";
import { CONVERSION_COOKIE, verifyConversionReceipt } from "@/lib/emails/conversion-receipt";
import { CONFIRM_RETRY_COOKIE } from "@/lib/emails/confirmation-flow";
import { verifyToken } from "@/lib/emails/tokens";
import EmailConfirmationForm from "@/components/EmailConfirmationForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Subscription confirmed",
  robots: { index: false, follow: false },
};

export default async function SubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; retryAfter?: string }>;
}) {
  const { status, retryAfter } = await searchParams;
  const cookieStore = await cookies();
  const receiptId = verifyConversionReceipt(cookieStore.get(CONVERSION_COOKIE)?.value);
  const retryToken = cookieStore.get(CONFIRM_RETRY_COOKIE)?.value;
  const canRetry = retryToken && verifyToken(retryToken, "confirm");
  const retryForm = canRetry ? <EmailConfirmationForm token={retryToken} retry /> : <p><Link href="/quiz" className="text-link">Return to my result →</Link></p>;

  if (status === "ok") {
    return (
      <EmailFlowCard eyebrow="You're all set" title="Check your inbox">
        {receiptId && <LeadPing receiptId={receiptId} />}
        <p>
          Your email is confirmed, and our email service has accepted your result
          and novena for sending. Give it a few minutes and check Spam, Junk, or
          Promotions. Look for “Your saint match” from Saint Discovery.
        </p>
        <details className="text-sm text-cream-dark mt-4"><summary className="cursor-pointer">My result email hasn’t arrived</summary><p className="mt-3">Wait at least a minute before requesting another copy. If you already have it, there’s nothing else to do.</p>{retryForm}<p className="mt-3">You can also reopen the confirmation link in your original email for seven days.</p></details>
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

  if (status === "pending" || status === "cooldown") {
    return (
      <EmailFlowCard eyebrow="You're confirmed" title={status === "cooldown" ? "Please wait before resending" : "Your result email hasn’t been sent yet"}>
        {receiptId && <LeadPing receiptId={receiptId} />}
        <p>
          {status === "cooldown" ? `Please check your inbox first. You can request another copy in about ${Math.max(1, Math.ceil(Math.min(3600, Math.max(0, Number(retryAfter) || 60)) / 60))} minute(s).` : "Your subscription is saved, but we couldn’t send your result email. Please wait a minute and try again below. It will not retry automatically."}
        </p>
        {retryForm}
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

  if (status === "save_failed") return <EmailFlowCard eyebrow="Please try again" title="We couldn’t finish confirmation">
    <p>We couldn’t save your subscription, so we haven’t sent your result email. Please try again. Your confirmation link still works for seven days.</p>
    {retryForm}
    <p className="text-sm">If this keeps happening, <a href="mailto:hello@saintdiscoveryquiz.com" className="text-link">contact us</a>.</p>
  </EmailFlowCard>;

  return (
    <EmailFlowCard eyebrow="Saint Discovery" title="This link is no longer valid">
      <p>
        That confirmation link has expired or wasn&rsquo;t recognized. Return to
        your saved quiz result and request a fresh confirmation email.
      </p>
      <p>
        <Link href="/quiz" className="text-gold hover:text-gold-light underline">
          Return to my result →
        </Link>
      </p>
    </EmailFlowCard>
  );
}
