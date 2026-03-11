import type { Metadata } from "next";
import Script from "next/script";
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C75CMC27YN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C75CMC27YN');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <LiturgicalTheme>{children}</LiturgicalTheme>
      </body>
    </html>
  );
}
