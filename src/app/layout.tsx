import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import { AppLayout } from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tarkov Tracker - Quest & Hideout Progress Tracker",
  description:
    "Track your Escape From Tarkov quests, hideout upgrades, and team progress for both PvP and PvE modes",
  keywords: [
    "Tarkov",
    "Escape From Tarkov",
    "Quest Tracker",
    "Hideout",
    "Progress",
  ],
  authors: [{ name: "Tarkov Tracker" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen overflow-hidden m-0 p-0`}
      >
        <AppProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
