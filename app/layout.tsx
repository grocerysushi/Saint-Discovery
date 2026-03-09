import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
