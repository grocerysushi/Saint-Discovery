import "server-only";
import { createAdminClient } from "@insforge/sdk";

export function getInsforgeAdmin() {
  const baseUrl = process.env.INSFORGE_BLOG_URL || process.env.NEXT_PUBLIC_INSFORGE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;
  if (!baseUrl || !apiKey) throw new Error("Server InsForge configuration is missing.");
  return createAdminClient({ baseUrl, apiKey });
}
