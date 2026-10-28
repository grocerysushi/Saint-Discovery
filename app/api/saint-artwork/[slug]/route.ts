import { NextResponse } from "next/server";
import { getSaintBySlug } from "@/lib/saints";
import { getSaintArtwork } from "@/lib/saint-artwork";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const saint = await getSaintBySlug(slug);
  if (!saint) return NextResponse.json({ error: "Saint not found" }, { status: 404 });
  return NextResponse.json(getSaintArtwork(saint), {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400" },
  });
}
