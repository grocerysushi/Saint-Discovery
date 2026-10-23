import { NextRequest, NextResponse } from "next/server";
import { getSaintOfDay } from "@/lib/saint-of-day";
import { localDateKey, validDateKey } from "@/lib/calendar-date";
import { getDailyExperience } from "@/lib/daily-experience";
import { getAllSaints } from "@/lib/saints";
import { getDirectoryDailyCards } from "@/lib/directory-page";
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? localDateKey();
  const cacheControl = request.nextUrl.searchParams.has("date") ? "public, max-age=300, s-maxage=3600" : "public, max-age=60, s-maxage=60";
  if (!validDateKey(date)) return NextResponse.json({ error: "Invalid calendar date" }, { status: 400 });
  if (request.nextUrl.searchParams.get("directory") === "1") {
    return NextResponse.json({ saints: getDirectoryDailyCards(await getAllSaints(), date) }, { headers: { "Cache-Control": cacheControl } });
  }
  if (request.nextUrl.searchParams.get("experience") === "1") {
    return NextResponse.json({ experience: await getDailyExperience(date) }, { headers: { "Cache-Control": cacheControl } });
  }
  return NextResponse.json({ saint: getSaintOfDay(date) }, { headers: { "Cache-Control": cacheControl } });
}
