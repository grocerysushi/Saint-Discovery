"use client";

import { useState, useSyncExternalStore } from "react";

const subscribeToShareSupport = () => () => {};
const canShare = () => typeof navigator.share === "function";
const serverCanShare = () => false;

const BUTTON_CLASS = `px-4 py-2.5 rounded-lg bg-navy border border-navy-lighter
  hover:border-gold/40 text-cream/80 hover:text-cream text-sm transition-colors`;

export default function ShareButtons({
  url,
  text,
}: {
  url: string;
  text: string;
}) {
  const [message, setMessage] = useState("");
  const [copyError, setCopyError] = useState(false);
  const nativeShare = useSyncExternalStore(subscribeToShareSupport, canShare, serverCanShare);
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setCopyError(false); setMessage(label); }
    catch { setCopyError(true); setMessage("Copy is unavailable. Select and copy the link below."); }
  }
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const targets = [
    {
      name: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
  ];

  return (
    <div className="share-tools">
      <div className="flex flex-wrap gap-3 mt-4">
      {nativeShare && <button type="button" className="btn-primary" onClick={async () => {
        try { await navigator.share({ title: "Saint Discovery", text, url }); setMessage("Sharing options opened."); }
        catch (error) { if (!(error instanceof Error && error.name === "AbortError")) { setCopyError(true); setMessage("Sharing is unavailable. Copy the link below instead."); } }
      }}>Share…</button>}
      <button type="button" className={BUTTON_CLASS} onClick={() => copy(url, "Link copied to clipboard.")}>Copy link</button>
      <button type="button" className={BUTTON_CLASS} onClick={() => copy(`${text}\n${url}`, "Message and link copied to clipboard.")}>Copy message</button>
      <a className={BUTTON_CLASS} href={`mailto:?subject=${encodeURIComponent("A discovery from Saint Discovery")}&body=${encodedText}%0A${encodedUrl}`}>Email</a>
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
      {targets.map((t) => (
        <a
          key={t.name}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className={BUTTON_CLASS}
        >
          {t.name}
        </a>
      ))}
      </div>
      <p role="status" className="text-sm text-gold mt-3">{message}</p>
      {copyError && <label className="block text-sm text-cream-dark mt-3">Share link<input className="share-link-input" value={url} readOnly onFocus={event => event.target.select()} /></label>}
    </div>
  );
}
