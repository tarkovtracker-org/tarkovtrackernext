"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { useTarkovData } from "@/lib/hooks/useTarkovData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

export function LevelSelector() {
  const { userProfile, setUserProfile } = useAppContext();
  const { playerLevels, loading } = useTarkovData({
    enableTasks: false,
    enableHideout: false,
  });

  const [selectedLevel, setSelectedLevel] = useState<number>(
    userProfile.level || 1
  );

  // Update local state when userProfile changes
  useEffect(() => {
    setSelectedLevel(userProfile.level || 1);
  }, [userProfile.level]);

  const handleLevelChange = (levelStr: string) => {
    const level = parseInt(levelStr);
    setSelectedLevel(level);

    setUserProfile((prev) => ({
      ...prev,
      level,
      lastUpdated: new Date(),
    }));
  };

  // Get current level data
  const currentLevelData = playerLevels.find(
    (pl) => pl.level === selectedLevel
  );
  const nextLevelData = playerLevels.find(
    (pl) => pl.level === selectedLevel + 1
  );

  // Calculate levels 1-79 (max level in Tarkov)
  const availableLevels = Array.from({ length: 79 }, (_, i) => i + 1);

  if (loading) {
    return (
      <Card className="base-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4" />
            Player Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-10 bg-tarkov-panel rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="base-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Award className="h-4 w-4 text-tarkov-orange" />
          Player Level
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedLevel.toString()}
          onValueChange={handleLevelChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {availableLevels.map((level) => {
              const levelData = playerLevels.find((pl) => pl.level === level);
              return (
                <SelectItem key={level} value={level.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>Level {level}</span>
                    {levelData && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {levelData.exp.toLocaleString()} XP
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Current Level Info */}
        {currentLevelData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current XP:</span>
              <span className="font-medium text-tarkov-orange">
                {currentLevelData.exp.toLocaleString()}
              </span>
            </div>

            {nextLevelData && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next Level:</span>
                <span className="font-medium">
                  {(nextLevelData.exp - currentLevelData.exp).toLocaleString()}{" "}
                  XP
                </span>
              </div>
            )}

            {/* Level Badge */}
            {currentLevelData.levelBadgeImageLink && (
              <div className="flex items-center gap-2 pt-2">
                <img
                  src={currentLevelData.levelBadgeImageLink}
                  alt={`Level ${selectedLevel} badge`}
                  className="w-8 h-8 object-contain"
                />
                <Badge variant="secondary" className="text-xs">
                  Level {selectedLevel}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Game Mode and PMC Faction Indicators */}
        <div className="pt-2 border-t border-tarkov">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Game Mode:</span>
              <Badge
                variant="outline"
                className={`text-xs ${
                  userProfile.currentGameMode === "pve"
                    ? "border-blue-400/50 text-blue-400"
                    : "border-red-400/50 text-red-400"
                }`}
              >
                {userProfile.currentGameMode.toUpperCase()}
              </Badge>
            </div>
            {userProfile.pmcFaction && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">PMC Faction:</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    userProfile.pmcFaction === "USEC"
                      ? "border-blue-400/50 text-blue-400"
                      : "border-red-400/50 text-red-400"
                  }`}
                >
                  {userProfile.pmcFaction}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
