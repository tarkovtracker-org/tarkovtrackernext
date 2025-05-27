"use client";

import { useAppContext } from "@/lib/context";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { userProfile, switchGameMode } = useAppContext();
  const router = useRouter();
  const gameMode = userProfile.currentGameMode;

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        backgroundColor: `hsl(var(--nav-bg))`,
        borderColor: `hsl(var(--nav-border))`,
      }}
    >
      <div className="flex h-16 items-center container-padding">
        <div className="flex items-center space-x-4">
          <h1
            className="text-xl font-bold tracking-tight title-gold animate-flicker cursor-pointer hover:opacity-80 transition-all"
            onClick={handleLogoClick}
          >
            Tarkov Tracker
          </h1>
          <Badge
            variant="secondary"
            className="text-xs bg-tarkov-panel text-tarkov-orange border-tarkov-border"
          >
            Beta
          </Badge>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {/* Game Mode Toggle */}
          <div className="flex items-center space-x-1 glass p-1 rounded-md">
            <button
              className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded cursor-pointer ${
                gameMode === "pvp"
                  ? "text-red-400 bg-red-500/20 border border-red-400/50"
                  : "text-red-400/50 bg-red-500/10 border border-red-400/20 hover:text-red-400 hover:bg-red-500/15 hover:border-red-400/30"
              }`}
              onClick={() => switchGameMode("pvp")}
            >
              PvP
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded cursor-pointer ${
                gameMode === "pve"
                  ? "text-blue-400 bg-blue-500/20 border border-blue-400/50"
                  : "text-blue-400/50 bg-blue-500/10 border border-blue-400/20 hover:text-blue-400 hover:bg-blue-500/15 hover:border-blue-400/30"
              }`}
              onClick={() => switchGameMode("pve")}
            >
              PvE
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
