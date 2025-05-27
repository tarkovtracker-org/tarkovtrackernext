"use client";

import { useAppContext } from "@/lib/context";
import { HideoutModuleItem } from "./hideout-module-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building, TrendingUp, CheckCircle } from "lucide-react";

export function HideoutModuleList() {
  const { getCurrentModeData } = useAppContext();
  const currentModeData = getCurrentModeData();
  const hideoutModules = currentModeData.hideoutModules;

  // Calculate overall hideout progress
  const totalLevels = hideoutModules.reduce(
    (sum, module) => sum + module.maxLevel,
    0
  );
  const currentLevels = hideoutModules.reduce(
    (sum, module) => sum + module.currentLevel,
    0
  );
  const overallProgress =
    totalLevels > 0 ? (currentLevels / totalLevels) * 100 : 0;

  // Calculate completed modules
  const completedModules = hideoutModules.filter(
    (module) => module.currentLevel >= module.maxLevel
  ).length;

  if (hideoutModules.length === 0) {
    return (
      <div className="container-padding section-spacing">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <Building className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">
              No Hideout Modules
            </h2>
            <p className="text-muted-foreground">
              No hideout modules are currently available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-padding section-spacing">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight title-gold">
              Hideout
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage and upgrade your hideout modules
            </p>
          </div>

          {/* Overall Progress Card */}
          <Card className="glass tactical-panel weathered">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-tarkov-panel border border-tarkov">
                    <Building className="h-6 w-6 text-tarkov-orange" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">
                      Overall Progress
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your hideout development status
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-tarkov-orange">
                    {Math.round(overallProgress)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={overallProgress} className="h-3" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-tarkov-orange" />
                    <span className="text-2xl font-bold text-tarkov-orange">
                      {currentLevels}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Levels
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-2xl font-bold text-success">
                      {completedModules}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completed Modules
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <Building className="h-4 w-4 text-info" />
                    <span className="text-2xl font-bold text-info">
                      {hideoutModules.length}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Modules
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hideout Modules Grid */}
        <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
          {hideoutModules.map((module, index) => (
            <div
              key={module.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <HideoutModuleItem module={module} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
