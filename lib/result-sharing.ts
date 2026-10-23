import { resultPath } from "./quiz-results";

export function resultInvitationUrl(slug: string) {
  const url = new URL(resultPath(slug), "https://www.saintdiscoveryquiz.com");
  url.searchParams.set("utm_source", "reader_share");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "quiz_invite");
  url.searchParams.set("utm_content", slug);
  return url.href;
}

const escapeXml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);

export function resultCardLines(name: string) {
  const lines: string[] = [];
  for (const word of name.trim().split(/\s+/)) {
    // Long names remain inside the frame, including an unusually long word.
    for (const part of word.match(/.{1,24}/gu) ?? []) {
      const last = lines.length - 1;
      if (last >= 0 && `${lines[last]} ${part}`.length <= 24) lines[last] += ` ${part}`;
      else lines.push(part);
    }
  }
  return lines;
}

// Original typography-only artwork: no external image, personal answers, or
// server image transformation. The browser renders the downloadable PNG.
export function resultCardSvg(name: string) {
  const lines = resultCardLines(name);
  const fontSize = Math.min(76, 1260 / Math.max(...lines.map(line => line.length), 1), 380 / Math.max(lines.length, 1));
  const lineHeight = fontSize * 1.2;
  const startY = 600 - (lines.length - 1) * lineHeight / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <title>A saint worth discovering: ${escapeXml(name)}</title>
  <rect width="1080" height="1350" fill="#142b37"/>
  <rect x="54" y="54" width="972" height="1242" rx="10" fill="none" stroke="#cfb779" stroke-width="2"/>
  <text x="540" y="168" text-anchor="middle" fill="#cfb779" font-family="Georgia,serif" font-size="46">Saint Discovery</text>
  <path d="M150 940V620a390 390 0 0 1 780 0v320" fill="#f4eedf"/>
  <text x="540" y="360" text-anchor="middle" fill="#142b37" font-family="Arial,sans-serif" font-size="30">A saint worth discovering</text>
  ${lines.map((line, i) => `<text x="540" y="${startY + i * lineHeight}" text-anchor="middle" fill="#142b37" font-family="Georgia,serif" font-size="${fontSize}">${escapeXml(line)}</text>`).join("")}
  <path d="M440 840H640" stroke="#8c7138" stroke-width="3"/>
  <text x="540" y="1050" text-anchor="middle" fill="#f4eedf" font-family="Georgia,serif" font-size="49">Who will you discover?</text>
  <text x="540" y="1120" text-anchor="middle" fill="#cfb779" font-family="Arial,sans-serif" font-size="30">Take the free saint quiz</text>
  <text x="540" y="1215" text-anchor="middle" fill="#f4eedf" font-family="Arial,sans-serif" font-size="30">saintdiscoveryquiz.com</text>
  </svg>`;
}
