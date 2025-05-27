"use client";

import { useAppContext } from "@/lib/context";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { userProfile } = useAppContext();
  const gameMode = userProfile.currentGameMode;

  return (
    <div
      className={cn(
        "min-h-screen bg-background overflow-hidden",
        gameMode === "pve" ? "theme-pve" : "theme-pvp"
      )}
    >
      <Navbar />
      <div className="flex h-[calc(100vh-4rem-1px)]">
        <Sidebar />
        <main className="flex-1 container-padding animate-fade-in overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
