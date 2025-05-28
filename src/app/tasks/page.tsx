"use client";

import { TaskList } from "@/components/tasks/task-list";
import { useTarkovData } from "@/lib/hooks/useTarkovData";
import { useAppContext } from "@/lib/context";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

export default function TasksPage() {
  const { userProfile } = useAppContext();
  const { tasks, loading, error, refetchTasks } = useTarkovData({
    enableTasks: true,
    enableHideout: false,
  });

  // Filter tasks based on current game mode
  const filteredTasks = tasks.filter((task) => {
    // Most tasks don't have faction restrictions and should be available in both modes
    // Only filter out tasks that are specifically restricted to the opposite faction
    if (task.factionName) {
      const factionLower = task.factionName.toLowerCase();

      if (userProfile.currentGameMode === "pve") {
        // In PvE mode, exclude tasks that are specifically PvP-only
        // But include tasks that are PvE-specific, USEC, BEAR, or have no specific restriction
        return factionLower !== "pvp";
      } else {
        // In PvP mode, exclude tasks that are specifically PvE-only
        // But include tasks that are PvP-specific, USEC, BEAR, or have no specific restriction
        return factionLower !== "pve";
      }
    }

    // If no faction info, show all tasks (most tasks don't have faction restrictions)
    return true;
  });

  // Debug info - only log when tasks change
  React.useEffect(() => {
    if (tasks.length > 0) {
      console.log("📊 Task Data Summary:");
      console.log(`- Raw tasks from GraphQL: ${tasks.length}`);
      console.log(`- Filtered tasks: ${filteredTasks.length}`);
      console.log(
        `- Tasks with factionName: ${tasks.filter((t) => t.factionName).length}`
      );

      // Check what faction names exist
      const factionNames = new Set(
        tasks.map((t) => t.factionName).filter(Boolean)
      );
      console.log("- Unique faction names:", Array.from(factionNames));

      // Group by trader
      const byTrader: Record<string, number> = {};
      tasks.forEach((task) => {
        const traderName = task.trader?.name || "No trader";
        if (!byTrader[traderName]) byTrader[traderName] = 0;
        byTrader[traderName]++;
      });

      console.log("- Tasks by trader:", byTrader);
    }
  }, [tasks.length, filteredTasks.length, tasks]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold title-gold">Tasks & Quests</h1>
          <p className="text-muted-foreground">
            Track your progress through Tarkov&apos;s quest system. Complete
            objectives, manage requirements, and unlock new challenges.
          </p>
        </div>

        <Card className="base-card">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-tarkov-orange" />
              <p className="text-muted-foreground">Loading Tarkov data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold title-gold">Tasks & Quests</h1>
          <p className="text-muted-foreground">
            Track your progress through Tarkov&apos;s quest system. Complete
            objectives, manage requirements, and unlock new challenges.
          </p>
        </div>

        <Card className="base-card border-red-500/30">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <div className="space-y-2">
                <p className="text-red-400 font-medium">
                  Failed to load Tarkov data
                </p>
                <p className="text-muted-foreground text-sm">
                  {error.message || "An unknown error occurred"}
                </p>
              </div>
              <Button
                onClick={refetchTasks}
                variant="outline"
                className="border-tarkov text-tarkov-orange hover:bg-tarkov-panel"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold title-gold">Tasks & Quests</h1>
        <p className="text-muted-foreground">
          Track your progress through Tarkov&apos;s quest system. Complete
          objectives, manage requirements, and unlock new challenges.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Game Mode:</span>
          <span
            className={`font-medium ${
              userProfile.currentGameMode === "pve"
                ? "text-blue-400"
                : "text-red-400"
            }`}
          >
            {userProfile.currentGameMode.toUpperCase()}
          </span>
          <span>•</span>
          <span>{filteredTasks.length} tasks available</span>
          <span>•</span>
          <span>Raw: {tasks.length} tasks</span>
          <Button
            onClick={() => {
              console.log("🔄 Force refetching tasks...");
              refetchTasks();
            }}
            variant="outline"
            size="sm"
            className="ml-4"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      <TaskList tasks={filteredTasks} userLevel={userProfile.level || 1} />
    </div>
  );
}
