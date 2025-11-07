import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "Strong Containers Delivery",
    template: "%s | Strong Containers Delivery",
  },
  description:
    "Modern container delivery management—track orders, assign drivers, and automate notifications.",
  keywords: [
    "container delivery",
    "logistics software",
    "dispatch",
    "driver management",
    "order tracking",
    "supabase",
    "next.js",
  ],
  openGraph: {
    title: "Strong Containers Delivery",
    description:
      "Streamline your container delivery operations with real-time tracking and automation.",
    url: "/",
    siteName: "Strong Containers Delivery",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strong Containers Delivery",
    description:
      "Streamline your container delivery operations with real-time tracking and automation.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  applicationName: "Strong Containers Delivery",
  robots: { index: true, follow: true },
};

import ToasterClient from "@/components/shared/ToasterClient";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReactQueryProvider } from "@/contexts/ReactQueryProvider";
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Strong Containers Delivery",
    url: "https://strong-containers.example.com",
    sameAs: [],
    logo: "/favicon.ico",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <ToasterClient />
        <AuthProvider>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
