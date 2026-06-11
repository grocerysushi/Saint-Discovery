import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import LiturgicalTheme from "@/components/LiturgicalTheme";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Which Catholic Saint Are You? | Saint Discovery",
    template: "%s | Saint Discovery",
  },
  description:
    "Take a Catholic saint personality quiz, discover your spiritual gifts, and explore trusted Catholic resources and saint biographies.",
  keywords: [
    "which catholic saint are you",
    "which catholic saint are you quiz",
    "catholic saint quiz",
    "catholic saint personality quiz",
    "patron saint quiz",
    "what saint are you quiz catholic",
    "catholic quiz",
    "discover your saint",
    "saint discovery quiz",
    "catholic saints directory",
    "saint of the day catholic",
    "catholic resources",
  ],
  applicationName: siteConfig.name,
  category: "religion",
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Which Catholic Saint Are You? | Saint Discovery",
    description:
      "Discover the Catholic saint who best reflects your spiritual gifts and explore a directory of saints and Catholic resources.",
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Saint Discovery Catholic saint quiz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Which Catholic Saint Are You? | Saint Discovery",
    description:
      "Take the Catholic saint quiz and explore saint biographies, feast days, and Catholic resources.",
    images: [absoluteUrl("/opengraph-image")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#081527",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: "en-US",
        publisher: { "@id": absoluteUrl("/#organization") },
      },
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icon"),
          width: 256,
          height: 256,
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
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
        <SpeedInsights />
      </body>
    </html>
  );
}
