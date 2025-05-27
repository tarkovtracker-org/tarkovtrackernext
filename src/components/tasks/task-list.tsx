"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { TaskItem } from "./task-item";
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
import { useAppContext } from "@/lib/context";
import { Trophy, User, MapPin, Filter } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const { updateTaskStatus, updateObjectiveStatus } = useAppContext();
  const [filterStatus, setFilterStatus] = useState<Task["status"] | "all">(
    "all"
  );
  const [filterTrader, setFilterTrader] = useState<string>("all");
  const [filterMap, setFilterMap] = useState<string>("all");

  // Get unique traders and maps
  const traders = Array.from(new Set(tasks.map((task) => task.trader))).sort();
  const maps = Array.from(
    new Set(
      tasks.map((task) => task.map).filter((map): map is string => Boolean(map))
    )
  ).sort();

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterTrader !== "all" && task.trader !== filterTrader) return false;
    if (filterMap !== "all" && task.map !== filterMap) return false;
    return true;
  });

  // Group tasks by trader
  const tasksByTrader = traders.reduce((acc, trader) => {
    acc[trader] = filteredTasks.filter((task) => task.trader === trader);
    return acc;
  }, {} as Record<string, Task[]>);

  // Group tasks by map
  const tasksByMap = maps.reduce((acc, map) => {
    acc[map] = filteredTasks.filter((task) => task.map === map);
    return acc;
  }, {} as Record<string, Task[]>);

  // Group tasks by status
  const tasksByStatus = {
    available: filteredTasks.filter((task) => task.status === "available"),
    active: filteredTasks.filter((task) => task.status === "active"),
    completed: filteredTasks.filter((task) => task.status === "completed"),
    locked: filteredTasks.filter((task) => task.status === "locked"),
  };

  const getStatusCount = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card className="base-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tarkov-orange">
            <Trophy className="h-5 w-5" />
            Task Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="base-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as Task["status"] | "all")
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

              return (
                <AccordionItem key={trader} value={trader}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full mr-4">
                      <span className="font-medium">{trader}</span>
                      <Badge variant="outline">
                        {traderTasks.length} tasks
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {traderTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onUpdateStatus={updateTaskStatus}
                        onUpdateObjective={updateObjectiveStatus}
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

              return (
                <AccordionItem key={map} value={map}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full mr-4">
                      <span className="font-medium">{map}</span>
                      <Badge variant="outline">{mapTasks.length} tasks</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {mapTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onUpdateStatus={updateTaskStatus}
                        onUpdateObjective={updateObjectiveStatus}
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

              return (
                <AccordionItem key={status} value={status}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full mr-4">
                      <span className="font-medium capitalize">{status}</span>
                      <Badge variant="outline">
                        {statusTasks.length} tasks
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {statusTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onUpdateStatus={updateTaskStatus}
                        onUpdateObjective={updateObjectiveStatus}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
