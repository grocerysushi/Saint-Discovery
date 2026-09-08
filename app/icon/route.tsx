import { ImageResponse } from "next/og";
import SiteIcon from "@/components/SiteIcon";

// Preserve existing links without emitting a competing automatic icon tag.
export function GET() {
  return new ImageResponse(<SiteIcon size={256} />, { width: 256, height: 256 });
}
