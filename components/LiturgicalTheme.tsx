"use client";

import { useEffect, useState } from "react";
import {
  getLiturgicalTheme,
  getMillisecondsUntilNextMidnight,
} from "@/lib/liturgical-theme";

export default function LiturgicalTheme({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState(() => getLiturgicalTheme());

  useEffect(() => {
    const updateTheme = () => setTheme(getLiturgicalTheme());

    updateTheme();

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      updateTheme();
      intervalId = window.setInterval(updateTheme, 24 * 60 * 60 * 1000);
    }, getMillisecondsUntilNextMidnight() + 1_000);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, String(value));
    });

    root.dataset.liturgicalColor = theme.color;
  }, [theme]);

  return (
    <div style={theme.cssVars} data-liturgical-color={theme.color}>
      {children}
    </div>
  );
}
