"use client";

import { useTarkovData } from "@/lib/hooks/useTarkovData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TarkovDataDemo() {
  const {
    loading,
    hideoutLoading,
    error,
    hideoutError,
    tasks,
    maps,
    traders,
    playerLevels,
    hideoutStations,
    availableLanguages,
    lastQueryTime,
    lastHideoutQueryTime,
    refetchAll,
  } = useTarkovData();

  if (loading && !tasks.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Tarkov data...</span>
      </div>
    );
  }

  if (error && !tasks.length) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <AlertCircle className="h-8 w-8" />
        <span className="ml-2">Error loading data: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarkov Data Demo</h1>
          <p className="text-muted-foreground">
            Data migrated from TarkovTracker Vue app using GraphQL
          </p>
        </div>
        <Button onClick={refetchAll} disabled={loading || hideoutLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              loading || hideoutLoading ? "animate-spin" : ""
            }`}
          />
          Refresh Data
        </Button>
      </div>

      {/* Data Status */}
      <Card>
        <CardHeader>
          <CardTitle>Data Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-4">
            <Badge variant={loading ? "secondary" : "default"}>
              Tasks: {loading ? "Loading..." : `${tasks.length} loaded`}
            </Badge>
            <Badge variant={hideoutLoading ? "secondary" : "default"}>
              Hideout:{" "}
              {hideoutLoading
                ? "Loading..."
                : `${hideoutStations.length} stations`}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Available languages: {availableLanguages.join(", ")}</p>
            {lastQueryTime && (
              <p>
                Last task update: {new Date(lastQueryTime).toLocaleString()}
              </p>
            )}
            {lastHideoutQueryTime && (
              <p>
                Last hideout update:{" "}
                {new Date(lastHideoutQueryTime).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="maps">Maps ({maps.length})</TabsTrigger>
          <TabsTrigger value="traders">Traders ({traders.length})</TabsTrigger>
          <TabsTrigger value="hideout">
            Hideout ({hideoutStations.length})
          </TabsTrigger>
          <TabsTrigger value="levels">
            Levels ({playerLevels.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                All tasks fetched from the Tarkov API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.slice(0, 12).map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{task.name}</h4>
                      <div className="flex items-center gap-2">
                        {task.trader && (
                          <Badge variant="outline">{task.trader.name}</Badge>
                        )}
                        {task.kappaRequired && (
                          <Badge variant="secondary">Kappa</Badge>
                        )}
                        {task.lightkeeperRequired && (
                          <Badge variant="secondary">Lightkeeper</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Level: {task.minPlayerLevel || 1} | XP:{" "}
                        {task.experience || 0}
                      </p>
                      {task.objectives && (
                        <p className="text-xs text-muted-foreground">
                          {task.objectives.length} objective(s)
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              {tasks.length > 12 && (
                <p className="text-center text-muted-foreground mt-4">
                  ... and {tasks.length - 12} more tasks
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maps</CardTitle>
              <CardDescription>All maps available in Tarkov</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {maps.map((map) => (
                  <Card key={map.id} className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{map.name}</h4>
                      {map.players && (
                        <Badge variant="outline">{map.players} players</Badge>
                      )}
                      {map.raidDuration && (
                        <p className="text-sm text-muted-foreground">
                          Duration: {map.raidDuration} minutes
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traders</CardTitle>
              <CardDescription>All traders in Tarkov</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {traders.map((trader) => (
                  <Card key={trader.id} className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{trader.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {trader.levels.length} loyalty levels
                      </p>
                      {trader.resetTime && (
                        <p className="text-xs text-muted-foreground">
                          Reset: {trader.resetTime}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hideout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hideout Stations</CardTitle>
              <CardDescription>
                All hideout stations and their upgrade levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {hideoutStations.map((station) => (
                  <Card key={station.id} className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{station.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {station.levels.length} levels available
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {station.levels.slice(0, 5).map((level) => (
                          <Badge
                            key={level.id}
                            variant="outline"
                            className="text-xs"
                          >
                            Lv.{level.level}
                          </Badge>
                        ))}
                        {station.levels.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{station.levels.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Player Levels</CardTitle>
              <CardDescription>
                Experience requirements for each player level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {playerLevels.slice(0, 20).map((level) => (
                  <div
                    key={level.level}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="font-medium">Level {level.level}</span>
                    <span className="text-sm text-muted-foreground">
                      {level.exp.toLocaleString()} XP
                    </span>
                  </div>
                ))}
              </div>
              {playerLevels.length > 20 && (
                <p className="text-center text-muted-foreground mt-4">
                  ... and {playerLevels.length - 20} more levels
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
