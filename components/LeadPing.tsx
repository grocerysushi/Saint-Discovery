"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

// Fires the GA4 lead conversion once when the double opt-in confirmation page
// renders. generate_lead is GA4's standard lead-gen event, so it can be marked
// as a key event and imported into Google Ads as the campaign conversion.
// A sessionStorage guard keeps reloads/back-navigation from double-counting.
export default function LeadPing() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("sd_lead")) return;
      sessionStorage.setItem("sd_lead", "1");
    } catch {
      // storage unavailable (private mode) — still record the conversion
    }
    track("generate_lead", { method: "email_confirm" });
  }, []);
  return null;
}
