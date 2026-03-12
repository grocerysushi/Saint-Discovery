import { ImageResponse } from "next/og";
import SiteIcon from "@/components/SiteIcon";

export const size = {
  width: 256,
  height: 256,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<SiteIcon size={256} />, size);
}
