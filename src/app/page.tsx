"use client";

import { useAppContext } from "@/lib/context";
import { DashboardOverview } from "@/components/dashboard/overview";
import { TestStorage } from "@/components/test-storage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Home, Package } from "lucide-react";

export default function Dashboard() {
  const { userProfile, getCurrentModeData } = useAppContext();
  const currentModeData = getCurrentModeData();

  const completedTasks = currentModeData.tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const totalTasks = currentModeData.tasks.length || 1;
  const questProgress = (completedTasks / totalTasks) * 100;

  const hideoutStations = currentModeData.hideoutModules.length;
  const maxHideoutLevel = hideoutStations * 3; // Assuming max 3 levels per station
  const currentHideoutLevel = currentModeData.hideoutModules.reduce(
    (total, module) => total + module.currentLevel,
    0
  );
  const hideoutProgress =
    maxHideoutLevel > 0 ? (currentHideoutLevel / maxHideoutLevel) * 100 : 0;

  // Welcome message logic
  const hasDisplayName = !!userProfile.displayName;
  const hasExistingData = completedTasks > 0 || currentHideoutLevel > 0;

  let welcomeMessage = "";
  if (hasDisplayName) {
    if (hasExistingData) {
      welcomeMessage = `Welcome back, ${userProfile.displayName}! Track your progress.`;
    } else {
      welcomeMessage = `Welcome to Tarkov Tracker, ${userProfile.displayName}! Start tracking your progress!`;
    }
  } else {
    if (hasExistingData) {
      welcomeMessage = "Welcome back, Operator! Track your progress.";
    } else {
      welcomeMessage =
        "Welcome to Tarkov Tracker, Operator! Start tracking your progress!";
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight title-gold">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">{welcomeMessage}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="base-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Quests Completed
            </CardTitle>
            <Trophy className="h-4 w-4 text-tarkov-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tarkov-orange">
              {completedTasks}
            </div>
            <Progress value={questProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} of {totalTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card
          className="base-card animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Hideout Progress
            </CardTitle>
            <Home className="h-4 w-4 text-tarkov-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tarkov-success">
              {currentHideoutLevel}
            </div>
            <Progress value={hideoutProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Level {currentHideoutLevel} total
            </p>
          </CardContent>
        </Card>

        <Card
          className="base-card animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Required Items
            </CardTitle>
            <Package className="h-4 w-4 text-tarkov-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tarkov-warning">
              {currentModeData.requiredItems.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Items being tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="base-card">
          <TabsTrigger value="overview" className="btn-tactical">
            Overview
          </TabsTrigger>
          <TabsTrigger value="recent" className="btn-tactical">
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="priorities" className="btn-tactical">
            Priorities
          </TabsTrigger>
          <TabsTrigger value="storage-test" className="btn-tactical">
            Storage Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card className="base-card animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-tarkov-orange flex items-center gap-2">
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Your latest quest completions and hideout upgrades
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No recent activity to display.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priorities" className="space-y-6">
          <Card className="base-card animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-tarkov-orange flex items-center gap-2">
                  Priority Items
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Items you need to find for quests and hideout upgrades
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No priority items set.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage-test" className="space-y-6">
          <Card className="base-card animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-tarkov-orange flex items-center gap-2">
                  Storage Test
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <TestStorage />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
