// Suggestions only: never change a recipient without their explicit choice.
const DOMAIN_TYPOS: Record<string, string> = {
  "gmail.con": "gmail.com", "gmai.com": "gmail.com", "gmial.com": "gmail.com",
  "gnail.com": "gmail.com", "gmail.co": "gmail.com", "yahoo.con": "yahoo.com",
  "hotmail.con": "hotmail.com", "outlook.con": "outlook.com", "icloud.con": "icloud.com",
};

export function suggestEmailAddress(value: string): string | null {
  const parts = value.trim().split("@");
  if (parts.length !== 2 || !parts[0]) return null;
  const domain = DOMAIN_TYPOS[parts[1].toLowerCase()];
  return domain ? `${parts[0]}@${domain}` : null;
}
