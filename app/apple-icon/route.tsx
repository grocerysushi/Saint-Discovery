import { ImageResponse } from "next/og";
import SiteIcon from "@/components/SiteIcon";

// Preserve existing links without emitting a competing automatic icon tag.
export function GET() {
  return new ImageResponse(<SiteIcon size={180} />, { width: 180, height: 180 });
}
