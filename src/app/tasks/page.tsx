"use client";

import { TaskList } from "@/components/tasks/task-list";
import { useGameModeData } from "@/lib/context";

export default function TasksPage() {
  const [gameModeData] = useGameModeData();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold title-gold">Tasks & Quests</h1>
        <p className="text-muted-foreground">
          Track your progress through Tarkov&apos;s quest system. Complete
          objectives, manage requirements, and unlock new challenges.
        </p>
      </div>
      <TaskList tasks={gameModeData.tasks} />
    </div>
  );
}
