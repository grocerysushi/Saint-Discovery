import "server-only";
import { createHmac } from "node:crypto";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { EMAIL_TOKEN_SECRET } from "./config";

// The database atomically reserves attempts across all server instances.
// Failed provider requests still consume a reservation; never retry implicitly.
export async function reserveSharedSend(email: string, purpose: "confirmation" | "result"): Promise<boolean> {
  if (!EMAIL_TOKEN_SECRET) return false;
  const recipient = createHmac("sha256", EMAIL_TOKEN_SECRET)
    .update(`send-budget:${email.trim().toLowerCase()}`).digest("hex");
  try {
    const { data, error } = await getInsforgeAdmin().database.rpc("reserve_email_send", {
      p_recipient: recipient, p_purpose: purpose,
    });
    return !error && data === true;
  } catch {
    return false; // An unavailable limiter must not open unrestricted sending.
  }
}
