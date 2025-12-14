"use client"
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/layout/theme-provider"
import Snowfall from 'react-snowfall'

//TODO Export Metadata and Viewport as constants later
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata: Metadata = {
  title: {
    default: "NC Creation - Portal",
    template: "%s | NC Creation",
  },
  description: "Manage and track portal data and articles with NC Creation Portal. View article IDs, priorities, status, and workflow information in an organized data table.",
  keywords: ["NC Creation", "Portal", "Article Management", "Data Table", "Workflow Tracking", "Assignment Tracking"],
  authors: [{ name: "NC Creation" }],
  creator: "NC Creation",
  publisher: "NC Creation",
  manifest: "/manifest.json",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NC Creation - Portal",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
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
    title: "NC Creation - Portal",
    description: "Manage and track portal data and articles with NC Creation Portal.",
    siteName: "NC Creation",
  },
  twitter: {
    card: "summary_large_image",
    title: "NC Creation - Portal",
    description: "Manage and track portal data and articles with NC Creation Portal.",
  },
};

 const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >   
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
          <Providers>{children}</Providers>
          <Snowfall snowflakeCount={30} />   
        </ThemeProvider>
        <Analytics/>
      </body>
    </html>
  );
}
