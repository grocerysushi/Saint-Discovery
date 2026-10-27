"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import { resultPath } from "@/lib/quiz-results";
import { resultCardSvg, resultInvitationUrl } from "@/lib/result-sharing";
import { track } from "@/lib/analytics";

const subscribeShareSupport = () => () => {};
const browserSupportsShare = () => typeof navigator.share === "function" && typeof navigator.canShare === "function";
const serverSupportsShare = () => false;

export default function ResultShare({ slug, name, matched = false }: { slug: string; name: string; matched?: boolean }) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const imageUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(resultCardSvg(name, matched))}`;
  const supportsShare = useSyncExternalStore(subscribeShareSupport, browserSupportsShare, serverSupportsShare);
  const placement = matched ? "quiz_result" : "shared_result";
  async function createCard(): Promise<Blob> {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1350;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.drawImage(image, 0, 0);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Image unavailable");
    return blob;
  }
  async function saveCard() {
    setSaving(true); setStatus("");
    try {
      const url = URL.createObjectURL(await createCard());
      const link = document.createElement("a");
      link.href = url; link.download = `saint-discovery-${slug}.png`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      track("result_card_download", { saint_slug: slug, link_placement: placement });
      setStatus("Card ready. Check your downloads, then share it with your invitation link.");
    } catch {
      setStatus("The card could not be saved in this browser. You can still copy or share your invitation link.");
    } finally { setSaving(false); }
  }
  async function shareCard() {
    setSaving(true); setStatus("");
    try {
      const file = new File([await createCard()], `saint-discovery-${slug}.png`, { type: "image/png" });
      const data = { title: "Saint Discovery", text: matched ? `I got ${name} on Saint Discovery. Which saint will you get?` : `Discover ${name} on Saint Discovery. Which saint will you get?`, url: resultInvitationUrl(slug), files: [file] };
      if (!navigator.canShare?.(data)) { setStatus("This browser can’t share the image and link together. Download the card and copy the invitation link below."); return; }
      track("result_invite_action", { method: "card_share_open", saint_slug: slug, link_placement: placement });
      await navigator.share(data);
      setStatus("Your sharing options opened. Check that your chosen app includes the link.");
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) setStatus("The image and link could not be shared together. Download the card and copy the invitation link below.");
    } finally { setSaving(false); }
  }
  return <section className="result-share-panel result-invitation" aria-labelledby="share-match-title">
    <h2 id="share-match-title">Invite someone to find their saint</h2>
    <p>{matched ? "Share your match and discover who a friend gets." : "Pass this discovery along, and invite a friend to take the quiz."} Your answers and trait scores stay private.</p>
    {supportsShare && <button className="btn-secondary result-card-share" type="button" disabled={saving} onClick={shareCard}>{saving ? "Preparing card…" : "Share image and invitation…"}</button>}
    <ShareButtons url={resultInvitationUrl(slug)} text={matched ? `I matched with ${name} on Saint Discovery. Which saint will you get?` : `Explore ${name} on Saint Discovery. Which saint will you get?`} invitation={{ slug, placement }} />
    <p role="status" className="result-card-status">{status}</p>
    <details className="result-card-details">
      <summary>Save a card to share</summary>
      <div className="result-card-download">
        {/* A local SVG preview avoids a network image or metered transformation. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} width={1080} height={1350} alt={`Result card: ${matched ? "I got " : ""}${name}. Who will you discover? Take the free saint quiz at saintdiscoveryquiz.com.`} />
        <div><p>A portrait-size card for your messages or Stories. Include your invitation link so friends can take the quiz.</p><button className="btn-secondary" type="button" disabled={saving} onClick={saveCard}>{saving ? "Preparing card…" : "Download card (PNG)"}</button></div>
      </div>
    </details>
    {matched && <Link href={resultPath(slug)} prefetch={false} target="_blank" rel="noopener noreferrer" className="text-link">Preview my shared result <span className="sr-only">(opens in a new tab)</span> ↗</Link>}
  </section>;
}
