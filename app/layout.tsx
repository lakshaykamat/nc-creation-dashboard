import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"

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
    default: "NC Creation - Portal",
    template: "%s | NC Creation",
  },
  description: "Manage and track portal data and articles with NC Creation Portal. View article IDs, priorities, status, and workflow information in an organized data table.",
  keywords: ["NC Creation", "Portal", "Article Management", "Data Table", "Workflow Tracking", "Assignment Tracking"],
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

export const viewport: Viewport = {
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
            forcedTheme="dark"
            disableTransitionOnChange
          >
        <Providers>{children}</Providers>
        </ThemeProvider>
        <Analytics/>
      </body>
    </html>
  );
}
