import { NextResponse } from "next/server";
import { getQuizCandidates } from "@/lib/quiz-candidates";

// Public, reviewed quiz candidates; no visitor answers or personal data.
export const dynamic = "force-static";
export function GET() {
  return NextResponse.json(getQuizCandidates(), { headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400" } });
}
