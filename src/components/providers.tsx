"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { GameMode, UserProgress, Team } from "@/lib/types";
import { loadProgress, saveProgress } from "@/lib/storage";

interface AppContextType {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  progress: UserProgress;
  updateProgress: (updates: Partial<UserProgress>) => void;
  team: Team | null;
  setTeam: (team: Team | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

export function Providers({ children }: { children: ReactNode }) {
  const [gameMode, setGameMode] = useState<GameMode>("pve");
  const [progress, setProgress] = useState<UserProgress>({
    pve: { quests: {}, hideout: {}, items: {} },
    pvp: { quests: {}, hideout: {}, items: {} },
  });
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    // Only load from localStorage on client side
    if (typeof window !== "undefined") {
      const savedProgress = loadProgress();
      if (savedProgress) {
        setProgress(savedProgress);
      }
    }
  }, []);

  const updateProgress = (updates: Partial<UserProgress>) => {
    const newProgress = { ...progress, ...updates };
    setProgress(newProgress);
    if (typeof window !== "undefined") {
      saveProgress(newProgress);
    }
  };

  return (
    <AppContext.Provider
      value={{
        gameMode,
        setGameMode,
        progress,
        updateProgress,
        team,
        setTeam,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}