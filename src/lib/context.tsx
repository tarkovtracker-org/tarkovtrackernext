"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  UserProfile,
  GameModeData,
  Task,
  HideoutModule,
  AggregatedRequiredItem,
  Team,
  TeamMember,
} from "./types";
import {
  usePersistentState,
  STORAGE_KEYS,
  createDefaultUserProfile,
  createDefaultGameModeData,
} from "./storage";

// Define a TeamJoinResult type for better error handling in joinTeam
type TeamJoinResult =
  | boolean
  | {
      errorType: "gameModeMismatch";
      requiredMode: "pve" | "pvp";
      errorMessage?: string;
    }
  | { errorType: "alreadyInTeam"; errorMessage?: string }
  | { errorType: "invalidCode"; errorMessage?: string }
  | { errorType: "unknownError"; errorMessage?: string };

interface AppContextType {
  // User profile state
  userProfile: UserProfile;
  setUserProfile: (
    profile: UserProfile | ((prev: UserProfile) => UserProfile)
  ) => void;
  updateDisplayName: (displayName: string) => void;

  // PvP game mode data
  pvpData: GameModeData;
  setPvpData: (
    data: GameModeData | ((prev: GameModeData) => GameModeData)
  ) => void;

  // PvE game mode data
  pveData: GameModeData;
  setPveData: (
    data: GameModeData | ((prev: GameModeData) => GameModeData)
  ) => void;

  // Helper functions
  getCurrentModeData: () => GameModeData;
  setCurrentModeData: (
    data: GameModeData | ((prev: GameModeData) => GameModeData)
  ) => void;
  switchGameMode: (mode: "pve" | "pvp") => void;

  // Task management functions
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: Task["status"]) => void;
  updateObjectiveStatus: (
    taskId: string,
    objectiveId: string,
    completed: boolean
  ) => void;
  getTasksByTrader: (trader: string) => Task[];
  getTasksByMap: (map: string) => Task[];
  getTasksByStatus: (status: Task["status"]) => Task[];

  // Hideout management functions
  upgradeHideoutModule: (moduleId: string) => void;
  updateRequiredItemQuantity: (
    moduleId: string,
    level: number,
    itemId: string,
    quantityFound: number
  ) => void;
  getHideoutModuleById: (moduleId: string) => HideoutModule | undefined;
  canUpgradeModule: (moduleId: string) => boolean;

  // Required items aggregation and management
  getAggregatedRequiredItems: () => AggregatedRequiredItem[];
  updateGlobalItemQuantity: (itemId: string, newFoundQuantity: number) => void;
  updateTaskRequiredItemQuantity: (
    taskId: string,
    itemId: string,
    quantityFound: number
  ) => void;

  // Team management functions
  createTeam: () => void;
  joinTeam: (inviteCode: string) => Promise<TeamJoinResult>; // Returns success status or detailed error
  inviteMember: (memberName: string) => void;
  kickMember: (memberId: string) => void;
  leaveTeam: () => void;
  disbandTeam: () => void;
  getCurrentTeam: () => Team | null;
  generateNewInviteCode: () => void; // Generate new invite code for existing team
  refreshTeam: () => Promise<void>; // Refresh team data from server
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Initialize persistent state for each data type
  const [userProfile, setUserProfile] = usePersistentState<UserProfile>(
    STORAGE_KEYS.USER_PROFILE,
    createDefaultUserProfile()
  );

  const [pvpData, setPvpData] = usePersistentState<GameModeData>(
    STORAGE_KEYS.PVP_DATA,
    createDefaultGameModeData()
  );

  const [pveData, setPveData] = usePersistentState<GameModeData>(
    STORAGE_KEYS.PVE_DATA,
    createDefaultGameModeData()
  );

  // Helper function to get current mode data
  const getCurrentModeData = (): GameModeData => {
    return userProfile.currentGameMode === "pvp" ? pvpData : pveData;
  };

  // Helper function to set current mode data
  const setCurrentModeData = (
    data: GameModeData | ((prev: GameModeData) => GameModeData)
  ) => {
    if (userProfile.currentGameMode === "pvp") {
      setPvpData(data);
    } else {
      setPveData(data);
    }
  };

  // Helper function to switch game modes
  const switchGameMode = (mode: "pve" | "pvp") => {
    setUserProfile((prev) => ({
      ...prev,
      currentGameMode: mode,
      lastUpdated: new Date(),
    }));
  };

  // Helper function to update display name
  const updateDisplayName = (displayName: string) => {
    setUserProfile((prev) => ({
      ...prev,
      displayName: displayName.trim() || undefined,
      lastUpdated: new Date(),
    }));
  };

  // Task management functions
  const addTask = (task: Task) => {
    setCurrentModeData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task],
      lastUpdated: new Date(),
    }));
  };

  const updateTaskStatus = (taskId: string, status: Task["status"]) => {
    setCurrentModeData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              startedAt:
                status === "active" && !task.startedAt
                  ? new Date()
                  : task.startedAt,
              completedAt:
                status === "completed" ? new Date() : task.completedAt,
            }
          : task
      ),
      lastUpdated: new Date(),
    }));
  };

  const updateObjectiveStatus = (
    taskId: string,
    objectiveId: string,
    completed: boolean
  ) => {
    setCurrentModeData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              objectives: task.objectives.map((objective) =>
                objective.id === objectiveId
                  ? { ...objective, completed }
                  : objective
              ),
            }
          : task
      ),
      lastUpdated: new Date(),
    }));
  };

  const getTasksByTrader = (trader: string): Task[] => {
    return getCurrentModeData().tasks.filter((task) => task.trader === trader);
  };

  const getTasksByMap = (map: string): Task[] => {
    return getCurrentModeData().tasks.filter((task) => task.map === map);
  };

  const getTasksByStatus = (status: Task["status"]): Task[] => {
    return getCurrentModeData().tasks.filter((task) => task.status === status);
  };

  // Hideout management functions
  const upgradeHideoutModule = (moduleId: string) => {
    setCurrentModeData((prev) => ({
      ...prev,
      hideoutModules: prev.hideoutModules.map((module) =>
        module.id === moduleId && module.currentLevel < module.maxLevel
          ? { ...module, currentLevel: module.currentLevel + 1 }
          : module
      ),
      lastUpdated: new Date(),
    }));
  };

  const updateRequiredItemQuantity = (
    moduleId: string,
    level: number,
    itemId: string,
    quantityFound: number
  ) => {
    setCurrentModeData((prev) => ({
      ...prev,
      hideoutModules: prev.hideoutModules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              requirementsPerLevel: {
                ...module.requirementsPerLevel,
                [level]: {
                  ...module.requirementsPerLevel[level],
                  requiredItems:
                    module.requirementsPerLevel[level]?.requiredItems.map(
                      (item) =>
                        item.itemId === itemId
                          ? { ...item, quantityFound }
                          : item
                    ) || [],
                },
              },
            }
          : module
      ),
      lastUpdated: new Date(),
    }));
  };

  const getHideoutModuleById = (
    moduleId: string
  ): HideoutModule | undefined => {
    return getCurrentModeData().hideoutModules.find(
      (module) => module.id === moduleId
    );
  };

  const canUpgradeModule = (moduleId: string): boolean => {
    const hideoutModule = getHideoutModuleById(moduleId);
    if (
      !hideoutModule ||
      hideoutModule.currentLevel >= hideoutModule.maxLevel
    ) {
      return false;
    }

    const nextLevel = hideoutModule.currentLevel + 1;
    const requirements = hideoutModule.requirementsPerLevel[nextLevel];

    if (!requirements) {
      return false;
    }

    // Check if all required items are found
    const itemsReady = requirements.requiredItems.every(
      (item) => item.quantityFound >= item.quantityNeeded
    );

    // Check if required modules are at the correct level
    const modulesReady = requirements.requiredModules.every((reqModule) => {
      const requiredModule = getHideoutModuleById(reqModule.moduleId);
      return requiredModule && requiredModule.currentLevel >= reqModule.level;
    });

    return itemsReady && modulesReady;
  };

  // Required items aggregation and management functions
  const getAggregatedRequiredItems = (): AggregatedRequiredItem[] => {
    const currentData = getCurrentModeData();
    const itemMap = new Map<string, AggregatedRequiredItem>();

    // Process tasks (active and available only)
    currentData.tasks
      .filter((task) => task.status === "active" || task.status === "available")
      .forEach((task) => {
        task.requiredItems.forEach((item) => {
          if (!itemMap.has(item.itemId)) {
            itemMap.set(item.itemId, {
              itemId: item.itemId,
              name: item.name,
              totalQuantityNeeded: 0,
              totalQuantityFound: 0,
              sources: [],
              priority: item.priority,
              fir: item.fir,
            });
          }

          const aggregatedItem = itemMap.get(item.itemId)!;
          aggregatedItem.totalQuantityNeeded += item.quantityNeeded;
          aggregatedItem.sources.push({
            type: "task",
            sourceName: task.name,
            quantityForSource: item.quantityNeeded,
            quantityFoundForSource: item.quantityFound,
          });
        });
      });

    // Process hideout modules (next level requirements for non-maxed modules)
    currentData.hideoutModules
      .filter((module) => module.currentLevel < module.maxLevel)
      .forEach((module) => {
        const nextLevel = module.currentLevel + 1;
        const requirements = module.requirementsPerLevel[nextLevel];

        if (requirements) {
          requirements.requiredItems.forEach((item) => {
            if (!itemMap.has(item.itemId)) {
              itemMap.set(item.itemId, {
                itemId: item.itemId,
                name: item.name,
                totalQuantityNeeded: 0,
                totalQuantityFound: 0,
                sources: [],
                priority: item.priority,
                fir: item.fir,
              });
            }

            const aggregatedItem = itemMap.get(item.itemId)!;
            aggregatedItem.totalQuantityNeeded += item.quantityNeeded;
            aggregatedItem.sources.push({
              type: "hideout",
              sourceName: `${module.name} (Level ${nextLevel})`,
              quantityForSource: item.quantityNeeded,
              quantityFoundForSource: item.quantityFound,
            });
          });
        }
      });

    // Calculate total found quantities
    itemMap.forEach((aggregatedItem) => {
      aggregatedItem.totalQuantityFound = aggregatedItem.sources.reduce(
        (total, source) => total + source.quantityFoundForSource,
        0
      );
    });

    return Array.from(itemMap.values());
  };

  const updateTaskRequiredItemQuantity = (
    taskId: string,
    itemId: string,
    quantityFound: number
  ) => {
    setCurrentModeData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              requiredItems: task.requiredItems.map((item) =>
                item.itemId === itemId
                  ? {
                      ...item,
                      quantityFound: Math.min(
                        quantityFound,
                        item.quantityNeeded
                      ),
                    }
                  : item
              ),
            }
          : task
      ),
      lastUpdated: new Date(),
    }));
  };

  const updateGlobalItemQuantity = (
    itemId: string,
    newFoundQuantity: number
  ) => {
    let remainingQuantity = newFoundQuantity;

    setCurrentModeData((prev) => {
      const updatedData = { ...prev };

      // Update tasks first (active and available)
      updatedData.tasks = prev.tasks.map((task) => {
        if (
          (task.status === "active" || task.status === "available") &&
          remainingQuantity > 0
        ) {
          const updatedRequiredItems = task.requiredItems.map((item) => {
            if (item.itemId === itemId && remainingQuantity > 0) {
              const canAllocate = Math.min(
                remainingQuantity,
                item.quantityNeeded
              );
              remainingQuantity -= canAllocate;
              return { ...item, quantityFound: canAllocate };
            }
            return item;
          });
          return { ...task, requiredItems: updatedRequiredItems };
        }
        return task;
      });

      // Update hideout modules (next level requirements)
      updatedData.hideoutModules = prev.hideoutModules.map((module) => {
        if (module.currentLevel < module.maxLevel && remainingQuantity > 0) {
          const nextLevel = module.currentLevel + 1;
          const requirements = module.requirementsPerLevel[nextLevel];

          if (requirements) {
            const updatedRequiredItems = requirements.requiredItems.map(
              (item) => {
                if (item.itemId === itemId && remainingQuantity > 0) {
                  const canAllocate = Math.min(
                    remainingQuantity,
                    item.quantityNeeded
                  );
                  remainingQuantity -= canAllocate;
                  return { ...item, quantityFound: canAllocate };
                }
                return item;
              }
            );

            return {
              ...module,
              requirementsPerLevel: {
                ...module.requirementsPerLevel,
                [nextLevel]: {
                  ...requirements,
                  requiredItems: updatedRequiredItems,
                },
              },
            };
          }
        }
        return module;
      });

      return {
        ...updatedData,
        lastUpdated: new Date(),
      };
    });
  };

  // Team management functions

  // Team management functions
  // Add these API functions to your context

  const createTeam = async () => {
    try {
      // Use the user's display name or default to "Player"
      const leaderName = userProfile.displayName || "Player";
      // Generate a team name based on the user's display name
      const teamName = `${leaderName}'s Team`;

      const teamResponse = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          leaderName,
          userId: userProfile.id,
          gameMode: userProfile.currentGameMode,
        }),
      });

      if (!teamResponse.ok) {
        throw new Error("Failed to create team");
      }

      const { team } = await teamResponse.json();

      setCurrentModeDataWithBackup((prev) => ({
        ...prev,
        team: team,
        lastUpdated: new Date(),
      }));

      const inviteCodeResponse = await fetch("/api/teams/invite-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userProfile.id,
          gameMode: userProfile.currentGameMode,
        }),
      });

      let newInviteCode;

      if (inviteCodeResponse.ok) {
        // If server responded successfully, use the returned invite code
        const data = await inviteCodeResponse.json();
        newInviteCode = data.inviteCode;
      } else {
        // Fallback to client-side generation if API fails
        newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.warn(
          "API error - falling back to client-side invite code generation"
        );

        // Attempt to sync the client-generated code with the server
        try {
          const syncResponse = await fetch("/api/teams/sync-code", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userProfile.id,
              inviteCode: newInviteCode,
              gameMode: userProfile.currentGameMode,
            }),
          });

          if (!syncResponse.ok) {
            console.warn(
              "Failed to sync client-generated invite code with server"
            );
          }
        } catch (syncError) {
          console.error(
            "Error syncing client-generated invite code:",
            syncError
          );
        }
      }

      // Update the context with the new invite code
      setCurrentModeDataWithBackup((prev) => {
        if (!prev.team) return prev;

        return {
          ...prev,
          team: {
            ...prev.team,
            inviteCode: newInviteCode,
            lastUpdated: new Date(),
          },
          lastUpdated: new Date(),
        };
      });

      return newInviteCode;
    } catch (error) {
      console.error("Error generating new invite code:", error);
      // Fallback to client-side generation in case of exception
      const fallbackCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Attempt to sync the fallback code with the server
      try {
        fetch("/api/teams/sync-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userProfile.id,
            inviteCode: fallbackCode,
            gameMode: userProfile.currentGameMode,
          }),
        }).catch((syncError) =>
          console.error("Error syncing fallback invite code:", syncError)
        );
      } catch (syncError) {
        console.error("Error initiating sync for fallback code:", syncError);
      }

      setCurrentModeDataWithBackup((prev) => {
        if (!prev.team) return prev;

        return {
          ...prev,
          team: {
            ...prev.team,
            inviteCode: fallbackCode,
            lastUpdated: new Date(),
          },
          lastUpdated: new Date(),
        };
      });

      return fallbackCode;
    }
  };

  const joinTeam = async (inviteCode: string): Promise<TeamJoinResult> => {
    try {
      console.log(`Attempting to join team with invite code: ${inviteCode}`);
      console.log(
        `User ID: ${userProfile.id}, Name: ${
          userProfile.displayName || userProfile.name
        }`
      );

      // Try to join the team directly
      const response = await fetch("/api/teams/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode,
          userName: userProfile.displayName || userProfile.name,
          userId: userProfile.id,
          gameMode: userProfile.currentGameMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Join team successful:", data);

        if (data.team) {
          // Set isSelf to true for the current user in the team members
          const updatedTeam = {
            ...data.team,
            members: data.team.members.map((member: TeamMember) => ({
              ...member,
              isSelf: member.id === userProfile.id,
            })),
          };

          setCurrentModeDataWithBackup((prev) => ({
            ...prev,
            team: updatedTeam,
            lastUpdated: new Date(),
          }));
          return true;
        }
      } else {
        // Get detailed error message from response if possible
        try {
          const errorData = await response.json();
          console.error(
            `Join team failed with status ${response.status}: ${
              errorData.error || "Unknown error"
            }`
          );

          // Check for specific error types based on error message content
          if (errorData.error && typeof errorData.error === "string") {
            // Check for game mode mismatch error
            if (errorData.error.includes("mode, but you're in")) {
              // Extract the required mode from the error message
              // Example: "This invite code is for PVP mode, but you're in PVE mode"
              const requiredModeMatch =
                errorData.error.match(/is for (\w+) mode/i);
              const requiredMode = requiredModeMatch
                ? requiredModeMatch[1].toLowerCase()
                : "unknown";

              return {
                errorType: "gameModeMismatch",
                requiredMode: requiredMode === "pvp" ? "pvp" : "pve",
                errorMessage: errorData.error,
              };
            }
            // Check for already in team error
            else if (
              errorData.error.includes("already in a") &&
              errorData.error.includes("team")
            ) {
              return {
                errorType: "alreadyInTeam",
                errorMessage: errorData.error,
              };
            }
            // Check for invalid code error
            else if (errorData.error.includes("Invalid invite code")) {
              return {
                errorType: "invalidCode",
                errorMessage: errorData.error,
              };
            }
          }

          // Return the actual error message for unknown errors
          return {
            errorType: "unknownError",
            errorMessage: errorData.error || "Unknown error",
          };
        } catch (e) {
          console.error(
            `Join team failed with status ${response.status}. Parse error: ${
              e instanceof Error ? e.message : "Unknown error"
            }`
          );
        }
        return { errorType: "unknownError" };
      }

      return { errorType: "unknownError" };
    } catch (error) {
      console.error("Error joining team:", error);
      return { errorType: "unknownError" };
    }
  };

  const generateNewInviteCode = async () => {
    try {
      const response = await fetch("/api/teams/invite-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userProfile.id,
          gameMode: userProfile.currentGameMode,
        }),
      });

      let newInviteCode;

      if (response.ok) {
        // If server responded successfully, use the returned invite code
        const data = await response.json();
        newInviteCode = data.inviteCode;
      } else {
        // Fallback to client-side generation if API fails
        newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.warn(
          "API error - falling back to client-side invite code generation"
        );

        // Attempt to sync the client-generated code with the server
        try {
          const syncResponse = await fetch("/api/teams/sync-code", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userProfile.id,
              inviteCode: newInviteCode,
              gameMode: userProfile.currentGameMode,
            }),
          });

          if (!syncResponse.ok) {
            console.warn(
              "Failed to sync client-generated invite code with server"
            );
          }
        } catch (syncError) {
          console.error(
            "Error syncing client-generated invite code:",
            syncError
          );
        }
      }

      // Update the context with the new invite code
      setCurrentModeDataWithBackup((prev) => {
        if (!prev.team) return prev;

        return {
          ...prev,
          team: {
            ...prev.team,
            inviteCode: newInviteCode,
            lastUpdated: new Date(),
          },
          lastUpdated: new Date(),
        };
      });

      return newInviteCode;
    } catch (error) {
      console.error("Error generating new invite code:", error);
      // Fallback to client-side generation in case of exception
      const fallbackCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Attempt to sync the fallback code with the server
      try {
        fetch("/api/teams/sync-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userProfile.id,
            inviteCode: fallbackCode,
            gameMode: userProfile.currentGameMode,
          }),
        }).catch((syncError) =>
          console.error("Error syncing fallback invite code:", syncError)
        );
      } catch (syncError) {
        console.error("Error initiating sync for fallback code:", syncError);
      }

      setCurrentModeDataWithBackup((prev) => {
        if (!prev.team) return prev;

        return {
          ...prev,
          team: {
            ...prev.team,
            inviteCode: fallbackCode,
            lastUpdated: new Date(),
          },
          lastUpdated: new Date(),
        };
      });

      return fallbackCode;
    }
  };

  const inviteMember = async (memberName: string) => {
    try {
      const response = await fetch("/api/teams/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userProfile.id,
          memberName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to invite member");
      }

      const { team } = await response.json();

      setCurrentModeDataWithBackup((prev) => ({
        ...prev,
        team: team,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      console.error("Error inviting member:", error);
    }
  };

  const kickMember = async (memberId: string) => {
    try {
      const response = await fetch("/api/teams/members", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userProfile.id,
          memberId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API call failed:", response.status, errorData);
        throw new Error(
          `Failed to kick member: ${errorData.error || "Unknown error"}`
        );
      }

      const { team } = await response.json();

      setCurrentModeDataWithBackup((prev) => ({
        ...prev,
        team: team,
        lastUpdated: new Date(),
      }));

      console.log("✅ Member kicked successfully");
    } catch (error) {
      console.error("❌ Error kicking member:", error);
      throw error; // Re-throw to allow UI to handle the error
    }
  };

  const leaveTeam = async () => {
    try {
      const response = await fetch("/api/teams/members", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userProfile.id,
          memberId: userProfile.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to leave team");
      }

      setCurrentModeDataWithBackup((prev) => ({
        ...prev,
        team: null,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      console.error("Error leaving team:", error);
    }
  };

  const disbandTeam = async () => {
    try {
      console.log("🔥 disbandTeam called - checking current team state");
      console.log("🔍 Stack trace:", new Error().stack);
      const currentTeam = getCurrentTeam();

      console.log("📊 Current user profile:", {
        id: userProfile.id,
        currentGameMode: userProfile.currentGameMode,
        displayName: userProfile.displayName,
      });

      console.log("📊 Current team from state:", currentTeam);

      if (!currentTeam) {
        console.log("❌ No team found to disband");
        throw new Error("No team found to disband");
      }

      console.log(
        "🔥 Attempting to disband team:",
        currentTeam.id,
        currentTeam.name,
        "Leader ID:",
        currentTeam.leaderId
      );

      // First, let's verify the team exists on the server
      console.log("🔍 Verifying team exists on server...");
      const verifyResponse = await fetch(
        `/api/teams?userId=${userProfile.id}&gameMode=${userProfile.currentGameMode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log("📊 Server team state:", verifyData.team);

        if (!verifyData.team) {
          console.log(
            "⚠️ No team found on server, but frontend has team state"
          );
          // Clear the frontend state to match server
          setCurrentModeDataWithBackup((prev) => ({
            ...prev,
            team: null,
            lastUpdated: new Date(),
          }));
          throw new Error("Team no longer exists on server");
        }
      }

      // Properly await the API call and handle the response
      const url = `/api/teams?userId=${userProfile.id}&gameMode=${userProfile.currentGameMode}`;
      console.log("🌐 Making DELETE request to:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);
      console.log(
        "📡 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API call failed:", response.status, errorData);
        throw new Error(
          `Failed to disband team: ${errorData.error || "Unknown error"}`
        );
      }

      const responseData = await response.json();
      console.log("✅ Team successfully disbanded via API:", responseData);

      // Only remove from local state if API call succeeded
      setCurrentModeDataWithBackup((prev) => ({
        ...prev,
        team: null,
        lastUpdated: new Date(),
      }));

      console.log("✅ Team removed from local state");
      return true;
    } catch (error) {
      console.error("❌ Error disbanding team:", error);

      // Don't automatically clear local state on error
      // Let the user know there was an issue
      throw error;
    }
  };

  const getCurrentTeam = (): Team | null => {
    return getCurrentModeData().team || null;
  };

  const refreshTeam = async () => {
    try {
      console.log("🔄 Refreshing team data...");
      const response = await fetch("/api/teams/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userProfile.id,
          gameMode: userProfile.currentGameMode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh team");
      }

      const { team } = await response.json();

      if (team) {
        console.log("✅ Team data refreshed from server:", team.name);
        setCurrentModeDataWithBackup((prev) => ({
          ...prev,
          team: team,
          lastUpdated: new Date(),
        }));
      } else {
        console.log(
          "⚠️ No team found on server, checking localStorage backup..."
        );
        const backupTeam = loadTeamFromLocalStorage();

        if (backupTeam) {
          console.log("🔄 Attempting to restore team from backup...");
          // Try to restore the team on the server
          try {
            const restoreResponse = await fetch("/api/teams", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                teamName: backupTeam.name,
                leaderName: userProfile.displayName || "Player",
                userId: userProfile.id,
                gameMode: userProfile.currentGameMode,
                initialInviteCode: backupTeam.inviteCode,
              }),
            });

            if (restoreResponse.ok) {
              const { team: restoredTeam } = await restoreResponse.json();
              console.log("✅ Team restored from backup:", restoredTeam.name);
              setCurrentModeDataWithBackup((prev) => ({
                ...prev,
                team: restoredTeam,
                lastUpdated: new Date(),
              }));
            } else {
              console.log("❌ Failed to restore team, clearing local state");
              setCurrentModeDataWithBackup((prev) => ({
                ...prev,
                team: null,
                lastUpdated: new Date(),
              }));
            }
          } catch (restoreError) {
            console.error("Error restoring team:", restoreError);
            setCurrentModeDataWithBackup((prev) => ({
              ...prev,
              team: null,
              lastUpdated: new Date(),
            }));
          }
        } else {
          console.log("ℹ️ No backup team found, user has no team");
          setCurrentModeDataWithBackup((prev) => ({
            ...prev,
            team: null,
            lastUpdated: new Date(),
          }));
        }
      }
    } catch (error) {
      console.error("Error refreshing team:", error);
      // Don't clear the team on refresh errors, keep existing state
    }
  };

  // Helper function to save team to localStorage as backup
  const saveTeamToLocalStorage = (team: Team | null) => {
    try {
      if (typeof window !== "undefined") {
        const key = `tarkov-tracker-team-${userProfile.id}`;
        if (team) {
          localStorage.setItem(key, JSON.stringify(team));
          console.log("💾 Team saved to localStorage backup");
        } else {
          localStorage.removeItem(key);
          console.log("💾 Team removed from localStorage backup");
        }
      }
    } catch (error) {
      console.warn("Failed to save team to localStorage:", error);
    }
  };

  // Helper function to load team from localStorage backup
  const loadTeamFromLocalStorage = (): Team | null => {
    try {
      if (typeof window !== "undefined") {
        const key = `tarkov-tracker-team-${userProfile.id}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const team = JSON.parse(saved);
          console.log("💾 Team loaded from localStorage backup:", team.name);
          return team;
        }
      }
    } catch (error) {
      console.warn("Failed to load team from localStorage:", error);
    }
    return null;
  };

  // Modified setCurrentModeData to also save team to localStorage
  const setCurrentModeDataWithBackup = (
    data: GameModeData | ((prev: GameModeData) => GameModeData)
  ) => {
    setCurrentModeData((prev) => {
      const newData = typeof data === "function" ? data(prev) : data;

      // Save team to localStorage backup
      saveTeamToLocalStorage(newData.team || null);

      return newData;
    });
  };

  // Update the context value to include the new functions
  const contextValue: AppContextType = {
    userProfile,
    setUserProfile,
    updateDisplayName,
    pvpData,
    setPvpData,
    pveData,
    setPveData,
    getCurrentModeData,
    setCurrentModeData,
    switchGameMode,
    addTask,
    updateTaskStatus,
    updateObjectiveStatus,
    getTasksByTrader,
    getTasksByMap,
    getTasksByStatus,
    upgradeHideoutModule,
    updateRequiredItemQuantity,
    getHideoutModuleById,
    canUpgradeModule,
    getAggregatedRequiredItems,
    updateGlobalItemQuantity,
    updateTaskRequiredItemQuantity,
    createTeam,
    joinTeam,
    inviteMember,
    kickMember,
    leaveTeam,
    disbandTeam,
    getCurrentTeam,
    generateNewInviteCode,
    refreshTeam,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

// Additional hooks for specific data types
export function useUserProfile() {
  const { userProfile, setUserProfile } = useAppContext();
  return [userProfile, setUserProfile] as const;
}

export function useGameModeData() {
  const { getCurrentModeData, setCurrentModeData } = useAppContext();
  return [getCurrentModeData(), setCurrentModeData] as const;
}

export function usePvpData() {
  const { pvpData, setPvpData } = useAppContext();
  return [pvpData, setPvpData] as const;
}

export function usePveData() {
  const { pveData, setPveData } = useAppContext();
  return [pveData, setPveData] as const;
}
