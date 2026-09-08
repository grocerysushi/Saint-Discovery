"use client";

import { useState } from "react";

const BUTTON_CLASS = `px-4 py-2.5 rounded-lg bg-navy border border-navy-lighter
  hover:border-gold/40 text-cream/80 hover:text-cream text-sm transition-colors`;

export default function ShareButtons({
  url,
  text,
}: {
  url: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
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
    <div className="flex flex-wrap gap-3 justify-center mt-6">
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
      <button
        onClick={async () => {
          try { await navigator.clipboard.writeText(`${text} ${url}`); setCopyError(false); setCopied(true); setTimeout(() => setCopied(false), 2000); }
          catch { setCopyError(true); }
        }}
        className={`${BUTTON_CLASS} cursor-pointer`}
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
      <span role="status" className={copyError ? "w-full text-sm text-cream-dark" : "sr-only"}>{copyError ? "Couldn’t copy the link. You can use one of the sharing options above." : copied ? "Link copied to clipboard" : ""}</span>
    </div>
  );
}
