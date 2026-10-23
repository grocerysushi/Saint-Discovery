"use client";

import { track } from "@/lib/analytics";
import { DISCORD_INVITE_URL, INSTAGRAM_PROFILE_URL, X_PROFILE_URL, PINTEREST_PROFILE_URL } from "@/lib/community";
import Image from "next/image";

const links = [
  { href: DISCORD_INVITE_URL, label: "Join Saint Discovery on Discord (18+; opens in a new tab)", icon: "/brand/discord.svg", width: 32, height: 24, event: "discord_join_click" },
  { href: INSTAGRAM_PROFILE_URL, label: "Follow Saint Discovery on Instagram (opens in a new tab)", icon: "/brand/instagram.svg", width: 24, height: 24, event: "instagram_profile_click" },
  { href: X_PROFILE_URL, label: "Follow Saint Discovery on X (opens in a new tab)", icon: "/brand/x.svg", width: 24, height: 24, event: "x_profile_click" },
  { href: PINTEREST_PROFILE_URL, label: "Follow Saint Discovery on Pinterest (opens in a new tab)", icon: "/brand/pinterest.png", width: 24, height: 24, event: "pinterest_profile_click" },
];

export default function ResultSocialLinks({ placement }: { placement: "quiz_result" | "shared_result" }) {
  return <div className="flex flex-wrap gap-3 mb-6">
    {links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
      aria-label={link.label} title={link.label}
      className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-navy-lighter bg-navy-light hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      onClick={() => track(link.event, { link_placement: placement })}>
      <Image src={link.icon} width={link.width} height={link.height} alt="" aria-hidden="true" className={link.event === "pinterest_profile_click" ? "rounded-full" : undefined} />
    </a>)}
  </div>;
}
