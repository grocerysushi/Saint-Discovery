"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const subscribeToShareSupport = () => () => {};
const canShare = () => typeof navigator.share === "function";
const serverCanShare = () => false;

// Shared Button with the original outlined share-chip styling.
const BUTTON_CLASS = `h-auto px-4 py-2.5 rounded-lg bg-navy border border-navy-lighter
  hover:border-gold/40 text-cream/80 hover:text-cream text-sm font-normal transition-colors`;

export default function ShareButtons({
  url,
  text,
  invitation,
}: {
  url: string;
  text: string;
  invitation?: { slug: string; placement: string };
}) {
  const [copyError, setCopyError] = useState(false);
  const linkId = useId();
  const nativeShare = useSyncExternalStore(subscribeToShareSupport, canShare, serverCanShare);
  function record(method: string) {
    // An action is not proof that the recipient visited or the message was sent.
    if (invitation) track("result_invite_action", { method, saint_slug: invitation.slug, link_placement: invitation.placement });
  }
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      record(value === url ? "copy_link" : "copy_message");
      setCopyError(false);
      toast.success(label);
    } catch {
      setCopyError(true);
      toast.error("Copy is unavailable. Select and copy the link below.");
    }
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
        {nativeShare && (
          <Button
            type="button"
            variant="gold"
            size="cta"
            onClick={async () => {
              try {
                record("native_share_open");
                await navigator.share({ title: "Saint Discovery", text, url });
                toast.success("Sharing options opened.");
              } catch (error) {
                if (!(error instanceof Error && error.name === "AbortError")) {
                  setCopyError(true);
                  toast.error("Sharing is unavailable. Copy the link below instead.");
                }
              }
            }}
          >
            {invitation ? "Invite a friend…" : "Share…"}
          </Button>
        )}
        {invitation && !nativeShare ? (
          <Button
            type="button"
            variant="gold"
            size="cta"
            onClick={() => copy(url, "Link copied to clipboard.")}
          >
            Copy invitation link
          </Button>
        ) : (
          <Button
            type="button"
            variant={null}
            size={null}
            className={BUTTON_CLASS}
            onClick={() => copy(url, "Link copied to clipboard.")}
          >
            {invitation ? "Copy invitation link" : "Copy link"}
          </Button>
        )}
        <Button
          type="button"
          variant={null}
          size={null}
          className={BUTTON_CLASS}
          onClick={() => copy(`${text}\n${url}`, "Message and link copied to clipboard.")}
        >
          Copy message
        </Button>
        <Button asChild variant={null} size={null} className={BUTTON_CLASS}>
          <a
            onClick={() => record("email_open")}
            href={`mailto:?subject=${encodeURIComponent("A discovery from Saint Discovery")}&body=${encodedText}%0A${encodedUrl}`}
          >
            Email
          </a>
        </Button>
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        {targets.map((t) => (
          <Button key={t.name} asChild variant={null} size={null} className={BUTTON_CLASS}>
            <a
              href={t.href}
              onClick={() => record(t.name === "Share on X" ? "x_open" : `${t.name.toLowerCase()}_open`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.name}
            </a>
          </Button>
        ))}
      </div>
      {copyError && (
        <div className="mt-3">
          <Label htmlFor={`share-link-${linkId}`} className="block text-sm leading-normal font-normal text-cream-dark">
            Share link
          </Label>
          <Input
            id={`share-link-${linkId}`}
            className="share-link-input h-auto text-sm"
            value={url}
            readOnly
            onFocus={event => event.target.select()}
          />
        </div>
      )}
    </div>
  );
}
