import { createClient } from "@insforge/sdk";

export function getInsforgePublic() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  if (!baseUrl || !anonKey) throw new Error("Public InsForge configuration is missing.");
  return createClient({ baseUrl, anonKey });
}
