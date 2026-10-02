"use client";

import { MotionConfig } from "framer-motion";

export default function LiturgicalTheme({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Site colors are stable. Only LiturgicalBanner displays the calendar color.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
