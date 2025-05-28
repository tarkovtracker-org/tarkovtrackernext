"use client";

import { useState } from "react";
import { Task } from "@/lib/graphql/types";
import { Task as LocalTask } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Trophy,
  User,
  MapPin,
  Filter,
  Star,
  Crown,
  Zap,
  Target,
  Award,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskListProps {
  tasks: Task[];
  userLevel?: number;
}

type TaskStatus = "locked" | "available" | "active" | "completed";

export function TaskList({ tasks, userLevel = 1 }: TaskListProps) {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterTrader, setFilterTrader] = useState<string>("all");
  const [filterMap, setFilterMap] = useState<string>("all");
  const [filterKappa, setFilterKappa] = useState<string>("all");
  const [filterLightkeeper, setFilterLightkeeper] = useState<string>("all");
  const [showLevelLocked, setShowLevelLocked] = useState<boolean>(false);

  // Get unique traders and maps
  const traders = Array.from(
    new Set(
      tasks
        .map((task) => task.trader?.name)
        .filter((trader): trader is string => Boolean(trader))
    )
  ).sort();

  const maps = Array.from(
    new Set(
      tasks
        .map((task) => task.map?.name)
        .filter((map): map is string => Boolean(map))
    )
  ).sort();

  // Convert GraphQL task to local task format for compatibility
  function convertToLocalTask(task: Task): LocalTask {
    // Determine task status based on level requirements
    let status: TaskStatus = "available";

    if (task.minPlayerLevel && task.minPlayerLevel > userLevel) {
      status = "locked";
    }

    return {
      id: task.id,
      name: task.name || "Unknown Task",
      trader: task.trader?.name || "Unknown",
      map: task.map?.name,
      objectives:
        task.objectives?.map((obj) => ({
          id: obj.id,
          description: obj.description || "No description",
          type:
            (obj.type as
              | "kill"
              | "find"
              | "extract"
              | "survive"
              | "skill"
              | "custom") || "custom",
          completed: false, // This would come from user progress
        })) || [],
      status,
      requiredItems: [], // This would be derived from objectives
      prerequisites: task.taskRequirements?.map((req) => req.task.id) || [],
      rewards: [
        ...(task.experience
          ? [{ type: "xp" as const, amount: task.experience }]
          : []),
        ...(task.finishRewards?.items?.map((item) => ({
          type: "item" as const,
          amount: item.count || 1,
          item: item.item?.name || "Unknown Item",
        })) || []),
      ],
      level: task.minPlayerLevel || 1,
      wiki: task.wikiLink,
    };
  }

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter((task) => {
    const localTask = convertToLocalTask(task);

    // Level filtering
    if (!showLevelLocked && localTask.status === "locked") {
      return false;
    }

    if (filterStatus !== "all" && localTask.status !== filterStatus)
      return false;
    if (filterTrader !== "all" && task.trader?.name !== filterTrader)
      return false;
    if (filterMap !== "all" && task.map?.name !== filterMap) return false;
    if (filterKappa !== "all") {
      if (filterKappa === "required" && !task.kappaRequired) return false;
      if (filterKappa === "not-required" && task.kappaRequired) return false;
    }
    if (filterLightkeeper !== "all") {
      if (filterLightkeeper === "required" && !task.lightkeeperRequired)
        return false;
      if (filterLightkeeper === "not-required" && task.lightkeeperRequired)
        return false;
    }
    return true;
  });

  // Group tasks by trader
  const tasksByTrader = traders.reduce((acc, trader) => {
    acc[trader] = filteredTasks.filter((task) => task.trader?.name === trader);
    return acc;
  }, {} as Record<string, Task[]>);

  // Group tasks by map
  const tasksByMap = maps.reduce((acc, map) => {
    acc[map] = filteredTasks.filter((task) => task.map?.name === map);
    return acc;
  }, {} as Record<string, Task[]>);

  // Group tasks by status (using converted tasks)
  const tasksByStatus = {
    available: filteredTasks.filter(
      (task) => convertToLocalTask(task).status === "available"
    ),
    active: filteredTasks.filter(
      (task) => convertToLocalTask(task).status === "active"
    ),
    completed: filteredTasks.filter(
      (task) => convertToLocalTask(task).status === "completed"
    ),
    locked: filteredTasks.filter(
      (task) => convertToLocalTask(task).status === "locked"
    ),
  };

  const getStatusCount = (status: TaskStatus) => {
    return tasks.filter((task) => convertToLocalTask(task).status === status)
      .length;
  };

  const getKappaCount = () => tasks.filter((task) => task.kappaRequired).length;
  const getLightkeeperCount = () =>
    tasks.filter((task) => task.lightkeeperRequired).length;
  const getAvailableXP = () =>
    filteredTasks.reduce((sum, task) => sum + (task.experience || 0), 0);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with stats */}
      <Card className="base-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tarkov-orange">
            <Trophy className="h-5 w-5" />
            Task Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {getStatusCount("available")}
              </div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {getStatusCount("active")}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {getStatusCount("completed")}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {getStatusCount("locked")}
              </div>
              <div className="text-sm text-muted-foreground">Locked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-1">
                <Crown className="h-5 w-5" />
                {getKappaCount()}
              </div>
              <div className="text-sm text-muted-foreground">Kappa</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                <Zap className="h-5 w-5" />
                {getLightkeeperCount()}
              </div>
              <div className="text-sm text-muted-foreground">Lightkeeper</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-tarkov">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-tarkov-orange" />
                <span className="text-muted-foreground">Available XP:</span>
                <span className="font-bold text-tarkov-orange">
                  {getAvailableXP().toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-tarkov-orange" />
                <span className="text-muted-foreground">Showing:</span>
                <span className="font-bold text-tarkov-orange">
                  {filteredTasks.length} / {tasks.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-tarkov-orange" />
                <span className="text-muted-foreground">Level:</span>
                <span className="font-bold text-tarkov-orange">
                  {userLevel}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Filters */}
      <Card className="base-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as TaskStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trader</label>
              <Select value={filterTrader} onValueChange={setFilterTrader}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Traders</SelectItem>
                  {traders.map((trader) => (
                    <SelectItem key={trader} value={trader}>
                      {trader}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Map</label>
              <Select value={filterMap} onValueChange={setFilterMap}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Maps</SelectItem>
                  {maps.map((map) => (
                    <SelectItem key={map} value={map}>
                      {map}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Kappa
              </label>
              <Select value={filterKappa} onValueChange={setFilterKappa}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="required">Required for Kappa</SelectItem>
                  <SelectItem value="not-required">Not Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Lightkeeper
              </label>
              <Select
                value={filterLightkeeper}
                onValueChange={setFilterLightkeeper}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="required">
                    Required for Lightkeeper
                  </SelectItem>
                  <SelectItem value="not-required">Not Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Award className="h-3 w-3" />
                Level Filter
              </label>
              <Select
                value={showLevelLocked ? "all" : "available"}
                onValueChange={(value) => setShowLevelLocked(value === "all")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available Only</SelectItem>
                  <SelectItem value="all">Show All Levels</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Display */}
      <Tabs defaultValue="trader" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trader" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            By Trader
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            By Map
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            By Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trader" className="space-y-4">
          <Accordion type="multiple" className="w-full">
            {traders.map((trader) => {
              const traderTasks = tasksByTrader[trader] || [];
              if (traderTasks.length === 0) return null;

              const traderXP = traderTasks.reduce(
                (sum, task) => sum + (task.experience || 0),
                0
              );
              const traderKappa = traderTasks.filter(
                (task) => task.kappaRequired
              ).length;

              return (
                <AccordionItem key={trader} value={trader}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{trader}</span>
                        {traderKappa > 0 && (
                          <Crown className="h-4 w-4 text-purple-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {traderTasks.length} tasks
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {traderXP.toLocaleString()} XP
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {traderTasks.map((task) => (
                      <EnhancedTaskCard
                        key={task.id}
                        task={task}
                        userLevel={userLevel}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Accordion type="multiple" className="w-full">
            {maps.map((map) => {
              const mapTasks = tasksByMap[map] || [];
              if (mapTasks.length === 0) return null;

              const mapXP = mapTasks.reduce(
                (sum, task) => sum + (task.experience || 0),
                0
              );

              return (
                <AccordionItem key={map} value={map}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full mr-4">
                      <span className="font-medium">{map}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{mapTasks.length} tasks</Badge>
                        <Badge variant="secondary" className="text-xs">
                          {mapXP.toLocaleString()} XP
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {mapTasks.map((task) => (
                      <EnhancedTaskCard
                        key={task.id}
                        task={task}
                        userLevel={userLevel}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Accordion type="multiple" className="w-full">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
              if (statusTasks.length === 0) return null;

              const statusXP = statusTasks.reduce(
                (sum, task) => sum + (task.experience || 0),
                0
              );

              return (
                <AccordionItem key={status} value={status}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full mr-4">
                      <span className="font-medium capitalize">{status}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {statusTasks.length} tasks
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {statusXP.toLocaleString()} XP
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {statusTasks.map((task) => (
                      <EnhancedTaskCard
                        key={task.id}
                        task={task}
                        userLevel={userLevel}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>
      </Tabs>

      {filteredTasks.length === 0 && (
        <Card className="base-card">
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No tasks found matching the current filters.
            </p>
            {!showLevelLocked && getStatusCount("locked") > 0 && (
              <p className="text-muted-foreground text-sm mt-2">
                Try enabling &quot;Show All Levels&quot; to see level-locked
                tasks.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Enhanced Task Card Component that displays comprehensive Tarkov data
function EnhancedTaskCard({
  task,
  userLevel = 1,
}: {
  task: Task;
  userLevel?: number;
}) {
  const isLevelLocked = task.minPlayerLevel && task.minPlayerLevel > userLevel;

  return (
    <Card
      className={`tactical-panel border-tarkov transition-all duration-200 hover:border-tarkov-orange/50 ${
        isLevelLocked ? "opacity-60" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-tarkov-orange" />
              {task.name}
              {task.kappaRequired && (
                <Crown className="h-4 w-4 text-purple-400" />
              )}
              {task.lightkeeperRequired && (
                <Zap className="h-4 w-4 text-orange-400" />
              )}
              {isLevelLocked && (
                <Badge
                  variant="outline"
                  className="bg-red-500/20 text-red-400 border-red-500/30 text-xs"
                >
                  Level {task.minPlayerLevel} Required
                </Badge>
              )}
            </CardTitle>

            <div className="flex flex-wrap gap-2 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-tarkov-orange">{task.trader?.name}</span>
              </div>

              {task.map && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-tarkov-orange">{task.map.name}</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-muted-foreground">
                <Award className="h-4 w-4" />
                <span className={isLevelLocked ? "text-red-400" : ""}>
                  Level {task.minPlayerLevel || 1}
                </span>
              </div>

              {task.experience && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-green-400 font-medium">
                    {task.experience.toLocaleString()} XP
                  </span>
                </div>
              )}
            </div>

            {/* Prerequisites */}
            {task.taskRequirements && task.taskRequirements.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span>Prerequisites: </span>
                {task.taskRequirements.map((req, index) => (
                  <span key={req.task.id}>
                    {req.task.name || req.task.id}
                    {index < task.taskRequirements!.length - 1 && ", "}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="outline"
              className={
                isLevelLocked
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              }
            >
              {isLevelLocked ? "Locked" : "Available"}
            </Badge>
            {task.wikiLink && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(task.wikiLink, "_blank")}
                className="border-tarkov text-tarkov-orange hover:bg-tarkov-panel text-xs h-6"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Wiki
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Objectives */}
        {task.objectives && task.objectives.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectives ({task.objectives.length})
            </h4>
            <div className="space-y-2">
              {task.objectives.map((objective, index) => (
                <div
                  key={objective.id}
                  className="flex items-start gap-2 p-2 bg-tarkov-panel rounded border border-tarkov/50"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-tarkov border border-tarkov-orange/30 flex items-center justify-center text-xs font-medium text-tarkov-orange">
                    {index + 1}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="text-foreground">{objective.description}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {objective.optional && (
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      )}
                      {objective.type && (
                        <Badge variant="outline" className="text-xs">
                          {objective.type}
                        </Badge>
                      )}
                      {objective.maps && objective.maps.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {objective.maps.map((m) => m.name).join(", ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards */}
        {(task.finishRewards?.items ||
          task.experience ||
          task.finishRewards?.traderStanding) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Rewards
            </h4>
            <div className="flex flex-wrap gap-2">
              {task.experience && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-500/20 text-green-400"
                >
                  {task.experience.toLocaleString()} XP
                </Badge>
              )}
              {task.finishRewards?.items?.map((item, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item.count}x {item.item?.name || "Unknown Item"}
                </Badge>
              ))}
              {task.finishRewards?.traderStanding?.map((standing, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-blue-500/20 text-blue-400"
                >
                  +{standing.standing} {standing.trader?.name} Rep
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
