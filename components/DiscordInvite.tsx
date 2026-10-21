"use client";

import { track } from "@/lib/analytics";
import { DISCORD_INVITE_URL } from "@/lib/community";
import Image from "next/image";

export default function DiscordInvite({ placement }: { placement: "quiz_result" | "shared_result" }) {
  const label = "Join Saint Discovery on Discord (18+; opens in a new tab)";
  return <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer"
    aria-label={label} title={label}
    className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-navy-lighter bg-navy-light mb-6 hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
    onClick={() => track("discord_join_click", { link_placement: placement })}>
    <Image src="/brand/discord.svg" width={32} height={24} alt="" aria-hidden="true" />
  </a>;
}
