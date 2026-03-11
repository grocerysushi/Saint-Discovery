import { ImageResponse } from "next/og";
import SiteIcon from "@/components/SiteIcon";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<SiteIcon size={180} />, size);
}
