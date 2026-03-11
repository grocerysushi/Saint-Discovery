import type { Metadata } from "next";
import "./globals.css";
import LiturgicalTheme from "@/components/LiturgicalTheme";

export const metadata: Metadata = {
  title: "Which Catholic Saint Are You?",
  description:
    "Discover the Catholic saint who shares your spiritual gifts through this personality quiz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LiturgicalTheme>{children}</LiturgicalTheme>
      </body>
    </html>
  );
}
