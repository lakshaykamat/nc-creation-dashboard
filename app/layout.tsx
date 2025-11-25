import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NC Creation - Portal Sheet",
    template: "%s | NC Creation",
  },
  description: "Manage and track portal data, articles, and assignments with NC Creation Portal Sheet. View article IDs, priorities, status, and workflow information in an organized data table.",
  keywords: ["NC Creation", "Portal Sheet", "Article Management", "Data Table", "Workflow Tracking", "Assignment Tracking"],
  authors: [{ name: "NC Creation" }],
  creator: "NC Creation",
  publisher: "NC Creation",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "NC Creation - Portal Sheet",
    description: "Manage and track portal data, articles, and assignments with NC Creation Portal Sheet.",
    siteName: "NC Creation",
  },
  twitter: {
    card: "summary_large_image",
    title: "NC Creation - Portal Sheet",
    description: "Manage and track portal data, articles, and assignments with NC Creation Portal Sheet.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
