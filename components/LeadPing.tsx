"use client";
import { useEffect } from "react";
import { trackConfirmedSubscription } from "@/lib/analytics";

// The server supplies this opaque ID only after verifying a signed receipt
// issued for a successfully saved, newly confirmed subscription.
export default function LeadPing({ receiptId }: { receiptId: string }) {
  useEffect(() => {
    trackConfirmedSubscription(receiptId);
  }, [receiptId]);
  return null;
}
