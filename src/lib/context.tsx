"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  UserProfile,
  GameModeData,
  Task,
  HideoutModule,
  AggregatedRequiredItem,
  Team,
} from "./types";
import {
  usePersistentState,
  STORAGE_KEYS,
  createDefaultUserProfile,
  createDefaultGameModeData,
} from "./storage";

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
  createTeam: (teamName: string, leaderName: string) => void;
  inviteMember: (memberName: string) => void;
  kickMember: (memberId: string) => void;
  leaveTeam: () => void;
  disbandTeam: () => void;
  getCurrentTeam: () => Team | null;
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
  const createTeam = (teamName: string, leaderName: string) => {
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: teamName,
      members: [
        {
          id: crypto.randomUUID(),
          name: leaderName,
          isSelf: true,
          joinedAt: new Date(),
        },
      ],
      leaderId: crypto.randomUUID(),
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    // Set the leaderId to the first member's id
    newTeam.leaderId = newTeam.members[0].id;

    setCurrentModeData((prev) => ({
      ...prev,
      team: newTeam,
      lastUpdated: new Date(),
    }));
  };

  const inviteMember = (memberName: string) => {
    const currentTeam = getCurrentModeData().team;
    if (!currentTeam) return;

    const newMember = {
      id: crypto.randomUUID(),
      name: memberName,
      isSelf: false,
      joinedAt: new Date(),
    };

    setCurrentModeData((prev) => ({
      ...prev,
      team: {
        ...currentTeam,
        members: [...currentTeam.members, newMember],
        lastUpdated: new Date(),
      },
      lastUpdated: new Date(),
    }));
  };

  const kickMember = (memberId: string) => {
    const currentTeam = getCurrentModeData().team;
    if (!currentTeam) return;

    // Don't allow kicking the leader or self
    const memberToKick = currentTeam.members.find((m) => m.id === memberId);
    if (
      !memberToKick ||
      memberToKick.id === currentTeam.leaderId ||
      memberToKick.isSelf
    )
      return;

    setCurrentModeData((prev) => ({
      ...prev,
      team: {
        ...currentTeam,
        members: currentTeam.members.filter((member) => member.id !== memberId),
        lastUpdated: new Date(),
      },
      lastUpdated: new Date(),
    }));
  };

  const leaveTeam = () => {
    const currentTeam = getCurrentModeData().team;
    if (!currentTeam) return;

    const selfMember = currentTeam.members.find((m) => m.isSelf);
    if (!selfMember) return;

    // If the leaving member is the leader, disband the team
    if (selfMember.id === currentTeam.leaderId) {
      disbandTeam();
      return;
    }

    // Remove self from team
    const updatedMembers = currentTeam.members.filter(
      (member) => !member.isSelf
    );

    // If no members left, disband
    if (updatedMembers.length === 0) {
      disbandTeam();
      return;
    }

    setCurrentModeData((prev) => ({
      ...prev,
      team: {
        ...currentTeam,
        members: updatedMembers,
        lastUpdated: new Date(),
      },
      lastUpdated: new Date(),
    }));
  };

  const disbandTeam = () => {
    setCurrentModeData((prev) => ({
      ...prev,
      team: null,
      lastUpdated: new Date(),
    }));
  };

  const getCurrentTeam = (): Team | null => {
    return getCurrentModeData().team;
  };

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
    inviteMember,
    kickMember,
    leaveTeam,
    disbandTeam,
    getCurrentTeam,
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
