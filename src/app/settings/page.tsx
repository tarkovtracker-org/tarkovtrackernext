"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Upload,
  Trash2,
  Settings as SettingsIcon,
  User,
  Palette,
  Save,
} from "lucide-react";
import { exportProgress, importProgress, clearProgress } from "@/lib/storage";
import { toast } from "sonner";

export default function SettingsPage() {
  const { userProfile, updateDisplayName } = useAppContext();
  const gameMode = userProfile.currentGameMode;
  const [displayName, setDisplayName] = useState(userProfile.displayName || "");

  const handleExport = () => {
    try {
      const data = exportProgress();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tarkov-progress-${gameMode}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Progress exported successfully");
    } catch {
      toast.error("Failed to export progress data");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result as string;
          if (importProgress(data)) {
            toast.success("Progress imported successfully");
            window.location.reload();
          } else {
            toast.error("Failed to import progress data");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (
      confirm(
        "Are you sure you want to clear all progress? This cannot be undone."
      )
    ) {
      clearProgress();
      toast.success("All progress has been cleared");
      window.location.reload();
    }
  };

  const handleSaveDisplayName = () => {
    updateDisplayName(displayName);
    toast.success("Display name updated successfully");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-tarkov-orange" />
          Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your preferences and data for Tarkov Tracker
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Profile */}
        <Card className="base-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-tarkov-orange">
              <User className="h-5 w-5" />
              User Profile
            </CardTitle>
            <CardDescription>
              Manage your profile settings and display preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSaveDisplayName}
                    className="btn-success"
                    disabled={displayName === userProfile.displayName}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This name will be used in welcome messages and team displays.
                  Leave empty to use &quot;Player&quot; or &quot;Operator&quot;.
                </p>
              </div>

              <div className="content-card p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Current Display Name:
                  </span>
                  <span className="text-tarkov-orange font-medium">
                    {userProfile.displayName || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(userProfile.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="base-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-tarkov-orange">
              <Palette className="h-5 w-5" />
              Theme Settings
            </CardTitle>
            <CardDescription>
              Customize the appearance of your tracker
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="content-card p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">PvE Theme:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-600 border border-blue-400"></div>
                  <span className="text-blue-400 text-sm">Dark Blue</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">PvP Theme:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-600 border border-red-400"></div>
                  <span className="text-red-400 text-sm">Dark Red</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Accent Color:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-tarkov-accent border border-tarkov-accent"></div>
                  <span className="text-tarkov-accent text-sm">Gold</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card className="base-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tarkov-orange">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, or clear your progress data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              onClick={handleExport}
              className="btn-tactical hover:glow-orange flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Progress
            </Button>
            <Button
              onClick={handleImport}
              className="btn-tactical hover:glow-orange flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Progress
            </Button>
            <Button
              onClick={handleClear}
              variant="destructive"
              className="flex items-center gap-2 font-bold bg-red-900 hover:bg-red-800 border-2 border-red-600 text-white shadow-lg"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
          </div>

          <Separator />

          <div className="content-card p-4">
            <h4 className="font-semibold text-tarkov-orange mb-2">
              Export Information
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Your export will include all progress data for both PvE and PvP
              modes:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Quest completion status and objectives</li>
              <li>Hideout module levels and requirements</li>
              <li>Required items tracking</li>
              <li>Team information and member data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
