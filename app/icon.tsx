import { ImageResponse } from "next/og";
import SiteIcon from "@/components/SiteIcon";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<SiteIcon size={64} />, size);
}
