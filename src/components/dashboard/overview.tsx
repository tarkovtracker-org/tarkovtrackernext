"use client";

import { useAppContext } from "@/lib/context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TeamStatusCard } from "./team-status-card"; // Import the new component
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Package,
  // Users icon is now in TeamStatusCard
} from "lucide-react";

export function DashboardOverview() {
  const { getTasksByStatus, getAggregatedRequiredItems } = useAppContext();
  // currentTeam is now handled by TeamStatusCard

  // Get real data from context
  const activeTasks = getTasksByStatus("active");
  const availableTasks = getTasksByStatus("available");
  const aggregatedItems = getAggregatedRequiredItems();

  // Get recent tasks (active and recently completed)
  const recentTasks = [
    ...activeTasks.slice(0, 2).map((task) => ({
      id: task.id,
      name: task.name,
      trader: task.trader,
      status: "active" as const,
      progress: Math.round(
        (task.objectives.filter((obj) => obj.completed).length /
          task.objectives.length) *
          100
      ),
    })),
    ...availableTasks.slice(0, 1).map((task) => ({
      id: task.id,
      name: task.name,
      trader: task.trader,
      status: "available" as const,
    })),
  ].slice(0, 3);

  // Get priority items (items with deficit, sorted by priority)
  const priorityItems = aggregatedItems
    .filter((item) => item.totalQuantityFound < item.totalQuantityNeeded)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (
        priorityOrder[b.priority as keyof typeof priorityOrder] -
        priorityOrder[a.priority as keyof typeof priorityOrder]
      );
    })
    .slice(0, 3)
    .map((item) => ({
      name: item.name,
      needed: item.totalQuantityNeeded,
      found: item.totalQuantityFound,
      sources: item.sources.map((s) => s.sourceName),
    }));

  // Calculate overall statistics
  const totalItems = aggregatedItems.length;
  const completedItems = aggregatedItems.filter(
    (item) => item.totalQuantityFound >= item.totalQuantityNeeded
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "secondary";
      case "available":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "available":
        return <Target className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Team Status */}
      <TeamStatusCard />

      {/* Recent Tasks */}
      <Card className="base-card animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-tarkov-orange flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Your latest task activity and progress
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-800/50 bg-gray-900/20"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.trader}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === "active" && task.progress !== undefined && (
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={task.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {task.progress}%
                      </span>
                    </div>
                  )}
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No task data available. Start tracking your progress!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Required Items Summary */}
      <Card className="base-card animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-tarkov-orange flex items-center gap-2">
              <Package className="h-5 w-5" />
              Required Items
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">Items needed for progression</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalItems > 0 ? (
            <>
              <div className="text-center p-4 rounded-lg border border-gray-800/50 bg-gray-900/20">
                <div className="text-2xl font-bold text-tarkov-orange">
                  {completedItems}/{totalItems}
                </div>
                <div className="text-sm text-muted-foreground">Items Found</div>
                <Progress
                  value={(completedItems / totalItems) * 100}
                  className="h-2 mt-2"
                />
              </div>

              {priorityItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Priority Items:
                  </h4>
                  {priorityItems.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-lg border border-gray-800/50 bg-gray-900/20 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-xs">{item.name}</p>
                        <Badge
                          variant={
                            item.found >= item.needed ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {item.found}/{item.needed}
                        </Badge>
                      </div>
                      <Progress
                        value={(item.found / item.needed) * 100}
                        className="h-1"
                      />
                      <div className="text-xs text-muted-foreground">
                        {item.sources.slice(0, 2).join(", ")}
                        {item.sources.length > 2 &&
                          ` +${item.sources.length - 2} more`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No required items found. Add some tasks or hideout modules!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
