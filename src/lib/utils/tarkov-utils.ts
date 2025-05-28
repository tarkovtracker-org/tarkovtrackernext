import type {
  Task,
  TaskObjective,
  HideoutStation,
  TarkovItem,
} from "@/lib/graphql/types";

/**
 * Filter tasks by trader
 */
export function filterTasksByTrader(tasks: Task[], traderId: string): Task[] {
  return tasks.filter((task) => task.trader?.id === traderId);
}

/**
 * Filter tasks by map
 */
export function filterTasksByMap(tasks: Task[], mapId: string): Task[] {
  return tasks.filter((task) => task.map?.id === mapId);
}

/**
 * Filter tasks by minimum player level
 */
export function filterTasksByLevel(
  tasks: Task[],
  minLevel: number,
  maxLevel?: number
): Task[] {
  return tasks.filter((task) => {
    const taskLevel = task.minPlayerLevel || 1;
    if (maxLevel) {
      return taskLevel >= minLevel && taskLevel <= maxLevel;
    }
    return taskLevel >= minLevel;
  });
}

/**
 * Filter tasks that are required for Kappa container
 */
export function getKappaTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.kappaRequired === true);
}

/**
 * Filter tasks that require Lightkeeper
 */
export function getLightkeeperTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.lightkeeperRequired === true);
}

/**
 * Get all unique items required for tasks
 */
export function getRequiredItemsFromTasks(tasks: Task[]): TarkovItem[] {
  const itemMap = new Map<string, TarkovItem>();

  tasks.forEach((task) => {
    task.objectives?.forEach((objective) => {
      if (objective.item) {
        itemMap.set(objective.item.id, objective.item);
      }
      if (objective.markerItem) {
        itemMap.set(objective.markerItem.id, objective.markerItem);
      }
      if (objective.usingWeapon) {
        itemMap.set(objective.usingWeapon.id, objective.usingWeapon);
      }
      if (objective.usingWeaponMods) {
        objective.usingWeaponMods.forEach((mod) => {
          itemMap.set(mod.id, mod);
        });
      }
      if (objective.wearing) {
        objective.wearing.forEach((item) => {
          itemMap.set(item.id, item);
        });
      }
      if (objective.useAny) {
        objective.useAny.forEach((item) => {
          itemMap.set(item.id, item);
        });
      }
      if (objective.containsAll) {
        objective.containsAll.forEach((item) => {
          itemMap.set(item.id, item);
        });
      }
    });
  });

  return Array.from(itemMap.values());
}

/**
 * Get all unique items required for hideout upgrades
 */
export function getRequiredItemsFromHideout(
  hideoutStations: HideoutStation[]
): TarkovItem[] {
  const itemMap = new Map<string, TarkovItem>();

  hideoutStations.forEach((station) => {
    station.levels.forEach((level) => {
      level.itemRequirements.forEach((requirement) => {
        itemMap.set(requirement.item.id, requirement.item);
      });
      level.crafts.forEach((craft) => {
        craft.requiredItems.forEach((requirement) => {
          itemMap.set(requirement.item.id, requirement.item);
        });
        craft.rewardItems.forEach((reward) => {
          itemMap.set(reward.item.id, reward.item);
        });
      });
    });
  });

  return Array.from(itemMap.values());
}

/**
 * Calculate total experience from completed tasks
 */
export function calculateTotalExperience(
  tasks: Task[],
  completedTaskIds: string[]
): number {
  return tasks
    .filter((task) => completedTaskIds.includes(task.id))
    .reduce((total, task) => total + (task.experience || 0), 0);
}

/**
 * Get tasks that can be started at a given player level
 */
export function getAvailableTasks(
  tasks: Task[],
  playerLevel: number,
  completedTaskIds: string[]
): Task[] {
  return tasks.filter((task) => {
    // Check level requirement
    if ((task.minPlayerLevel || 1) > playerLevel) {
      return false;
    }

    // Check if already completed
    if (completedTaskIds.includes(task.id)) {
      return false;
    }

    // Check task prerequisites
    if (task.taskRequirements) {
      const hasUnmetRequirements = task.taskRequirements.some((requirement) => {
        return !completedTaskIds.includes(requirement.task.id);
      });
      if (hasUnmetRequirements) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Group tasks by trader
 */
export function groupTasksByTrader(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    const traderId = task.trader?.id || "unknown";
    if (!grouped[traderId]) {
      grouped[traderId] = [];
    }
    grouped[traderId].push(task);
  });

  return grouped;
}

/**
 * Group tasks by map
 */
export function groupTasksByMap(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    const mapId = task.map?.id || "any";
    if (!grouped[mapId]) {
      grouped[mapId] = [];
    }
    grouped[mapId].push(task);
  });

  return grouped;
}

/**
 * Sort tasks by level requirement and then by name
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const levelA = a.minPlayerLevel || 1;
    const levelB = b.minPlayerLevel || 1;

    if (levelA !== levelB) {
      return levelA - levelB;
    }

    return (a.name || "").localeCompare(b.name || "");
  });
}

/**
 * Get hideout station by ID
 */
export function getHideoutStationById(
  hideoutStations: HideoutStation[],
  stationId: string
): HideoutStation | undefined {
  return hideoutStations.find((station) => station.id === stationId);
}

/**
 * Check if a hideout level can be built based on requirements
 */
export function canBuildHideoutLevel(
  level: HideoutStation["levels"][0],
  playerLevel: number,
  completedStationLevels: Record<string, number>,
  availableItems: Record<string, number>
): boolean {
  // Check station level requirements
  for (const requirement of level.stationLevelRequirements) {
    const currentLevel = completedStationLevels[requirement.station.id] || 0;
    if (currentLevel < requirement.level) {
      return false;
    }
  }

  // Check item requirements
  for (const requirement of level.itemRequirements) {
    const availableCount = availableItems[requirement.item.id] || 0;
    if (availableCount < requirement.count) {
      return false;
    }
  }

  return true;
}

/**
 * Format time duration in a human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

/**
 * Get item image URL with fallback
 */
export function getItemImageUrl(
  item: TarkovItem,
  size: "icon" | "grid" | "512px" = "icon"
): string {
  switch (size) {
    case "icon":
      return item.iconLink || item.gridImageLink || item.image512pxLink || "";
    case "grid":
      return item.gridImageLink || item.iconLink || item.image512pxLink || "";
    case "512px":
      return item.image512pxLink || item.gridImageLink || item.iconLink || "";
    default:
      return item.iconLink || "";
  }
}
