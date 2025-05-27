import { useState, useEffect, useCallback } from "react";
import { UserProfile, GameModeData, UserProgress } from "./types";

// Storage keys for different data types
export const STORAGE_KEYS = {
  USER_PROFILE: "tarkov-tracker-user-profile",
  PVP_DATA: "tarkov-tracker-pvp-data",
  PVE_DATA: "tarkov-tracker-pve-data",
  TEAM_DATA: "tarkov-tracker-team-data",
  // Legacy key for backward compatibility
  PROGRESS: "tarkov-tracker-progress"
} as const;

/**
 * Generic function to save data to localStorage with error handling
 */
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    const serializedData = JSON.stringify(data, (key, value) => {
      // Handle Date objects properly during serialization
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Failed to save data to localStorage with key "${key}":`, error);
    // Could implement fallback storage or user notification here
  }
}

/**
 * Generic function to load data from localStorage with error handling
 */
export function loadFromLocalStorage<T>(key: string): T | null {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return null;
  }
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    
    const parsedData = JSON.parse(item, (key, value) => {
      // Handle Date objects properly during deserialization
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
      }
      return value;
    });
    
    return parsedData as T;
  } catch (error) {
    console.error(`Failed to load data from localStorage with key "${key}":`, error);
    return null;
  }
}

/**
 * Custom React hook for persistent state that automatically saves to localStorage
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state from localStorage or use default value
  const [state, setState] = useState<T>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = loadFromLocalStorage<T>(key);
      if (stored !== null) {
        setState(stored);
      }
      setIsInitialized(true);
    }
  }, [key]);

  // Save to localStorage whenever state changes (but only after initialization)
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      saveToLocalStorage(key, state);
    }
  }, [key, state, isInitialized]);

  // Enhanced setState that supports functional updates
  const setPersistentState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newState = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;
      return newState;
    });
  }, []);

  return [state, setPersistentState];
}

/**
 * Initialize default user profile
 */
export function createDefaultUserProfile(): UserProfile {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: "Player",
    currentGameMode: "pve",
    preferences: {
      theme: "dark",
      autoSave: true,
      notifications: true
    },
    createdAt: now,
    lastUpdated: now
  };
}

/**
 * Initialize default game mode data
 */
export function createDefaultGameModeData(): GameModeData {
  return {
    tasks: [
      {
        id: "debut",
        name: "Debut",
        trader: "Prapor",
        map: "Customs",
        objectives: [
          {
            id: "debut-1",
            description: "Eliminate 5 Scavs on Customs",
            type: "kill",
            target: "Scav",
            count: 5,
            location: "Customs",
            completed: false
          }
        ],
        status: "available",
        requiredItems: [],
        prerequisites: [],
        rewards: [
          {
            type: "xp",
            amount: 1000
          },
          {
            type: "money",
            amount: 5000
          }
        ],
        level: 1
      },
      {
        id: "checking",
        name: "Checking",
        trader: "Prapor",
        map: "Customs",
        objectives: [
          {
            id: "checking-1",
            description: "Locate the water pump",
            type: "find",
            target: "Water pump",
            location: "Customs",
            completed: false
          },
          {
            id: "checking-2",
            description: "Survive and extract from the location",
            type: "extract",
            location: "Customs",
            completed: false
          }
        ],
        status: "locked",
        requiredItems: [],
        prerequisites: ["debut"],
        rewards: [
          {
            type: "xp",
            amount: 1500
          }
        ],
        level: 2
      },
      {
        id: "operation-aquarius-1",
        name: "Operation Aquarius - Part 1",
        trader: "Therapist",
        map: "Customs",
        objectives: [
          {
            id: "aquarius-1-1",
            description: "Locate the hidden water stash",
            type: "find",
            target: "Water stash",
            location: "Customs",
            completed: false
          },
          {
            id: "aquarius-1-2",
            description: "Hand over 2 bottles of water",
            type: "custom",
            target: "Water bottle",
            count: 2,
            completed: false
          }
        ],
        status: "available",
        requiredItems: [
          {
            itemId: "water-bottle",
            name: "Bottle of water",
            quantityNeeded: 2,
            quantityFound: 0,
            priority: "medium",
            sources: ["Scav runs", "Stores"],
            fir: false
          }
        ],
        prerequisites: [],
        rewards: [
          {
            type: "xp",
            amount: 2000
          },
          {
            type: "trader_rep",
            amount: 0.02,
            trader: "Therapist"
          }
        ],
        level: 1
      }
    ],
    hideoutModules: [
      {
        id: "security",
        name: "Security",
        currentLevel: 0,
        maxLevel: 3,
        description: "Provides security for your hideout and unlocks additional features",
        icon: "shield",
        constructionTime: "30m",
        bonuses: ["Scav case unlock", "Insurance return time reduction"],
        requirementsPerLevel: {
          1: {
            requiredItems: [
              {
                itemId: "bolts",
                name: "Bolts",
                quantityNeeded: 4,
                quantityFound: 0,
                priority: "medium",
                sources: ["Hardware stores", "Industrial spawns"],
                fir: false
              },
              {
                itemId: "screws",
                name: "Screws",
                quantityNeeded: 6,
                quantityFound: 0,
                priority: "medium",
                sources: ["Hardware stores", "Toolboxes"],
                fir: false
              }
            ],
            requiredModules: []
          },
          2: {
            requiredItems: [
              {
                itemId: "metal-parts",
                name: "Metal parts",
                quantityNeeded: 5,
                quantityFound: 0,
                priority: "high",
                sources: ["Industrial areas", "Scav runs"],
                fir: false
              },
              {
                itemId: "electronics",
                name: "Electronics",
                quantityNeeded: 3,
                quantityFound: 0,
                priority: "high",
                sources: ["Tech stores", "Computers"],
                fir: false
              }
            ],
            requiredModules: [
              { moduleId: "security", level: 1 }
            ]
          },
          3: {
            requiredItems: [
              {
                itemId: "military-circuit",
                name: "Military circuit board",
                quantityNeeded: 2,
                quantityFound: 0,
                priority: "high",
                sources: ["Military spawns", "Labs"],
                fir: true
              }
            ],
            requiredModules: [
              { moduleId: "security", level: 2 }
            ]
          }
        }
      },
      {
        id: "workbench",
        name: "Workbench",
        currentLevel: 0,
        maxLevel: 3,
        description: "Allows crafting of various items and ammunition",
        icon: "wrench",
        constructionTime: "45m",
        bonuses: ["Weapon modding", "Ammo crafting", "Item repair"],
        requirementsPerLevel: {
          1: {
            requiredItems: [
              {
                itemId: "wood-plank",
                name: "Wooden plank",
                quantityNeeded: 8,
                quantityFound: 0,
                priority: "low",
                sources: ["Construction sites", "Lumber"],
                fir: false
              },
              {
                itemId: "nails",
                name: "Nails",
                quantityNeeded: 10,
                quantityFound: 0,
                priority: "low",
                sources: ["Hardware stores", "Toolboxes"],
                fir: false
              }
            ],
            requiredModules: []
          },
          2: {
            requiredItems: [
              {
                itemId: "drill",
                name: "Electric drill",
                quantityNeeded: 1,
                quantityFound: 0,
                priority: "medium",
                sources: ["Hardware stores", "Garages"],
                fir: false
              },
              {
                itemId: "metal-parts",
                name: "Metal parts",
                quantityNeeded: 3,
                quantityFound: 0,
                priority: "medium",
                sources: ["Industrial areas", "Scav runs"],
                fir: false
              }
            ],
            requiredModules: [
              { moduleId: "workbench", level: 1 }
            ]
          },
          3: {
            requiredItems: [
              {
                itemId: "advanced-tools",
                name: "Advanced tool set",
                quantityNeeded: 1,
                quantityFound: 0,
                priority: "high",
                sources: ["Rare spawns", "Barter trades"],
                fir: false
              }
            ],
            requiredModules: [
              { moduleId: "workbench", level: 2 },
              { moduleId: "security", level: 1 }
            ]
          }
        }
      },
      {
        id: "medstation",
        name: "Medstation",
        currentLevel: 0,
        maxLevel: 3,
        description: "Provides medical supplies and healing capabilities",
        icon: "heart",
        constructionTime: "20m",
        bonuses: ["Health regeneration", "Medical crafting", "Painkiller effects"],
        requirementsPerLevel: {
          1: {
            requiredItems: [
              {
                itemId: "morphine",
                name: "Morphine",
                quantityNeeded: 1,
                quantityFound: 0,
                priority: "medium",
                sources: ["Medical spawns", "Therapist"],
                fir: false
              },
              {
                itemId: "bandage",
                name: "Bandage",
                quantityNeeded: 5,
                quantityFound: 0,
                priority: "low",
                sources: ["Medical spawns", "Scav runs"],
                fir: false
              }
            ],
            requiredModules: []
          },
          2: {
            requiredItems: [
              {
                itemId: "medical-tools",
                name: "Medical tools",
                quantityNeeded: 2,
                quantityFound: 0,
                priority: "medium",
                sources: ["Medical areas", "Therapist barter"],
                fir: false
              }
            ],
            requiredModules: [
              { moduleId: "medstation", level: 1 }
            ]
          },
          3: {
            requiredItems: [
              {
                itemId: "defibrillator",
                name: "Defibrillator",
                quantityNeeded: 1,
                quantityFound: 0,
                priority: "high",
                sources: ["Rare medical spawns", "Labs"],
                fir: true
              }
            ],
            requiredModules: [
              { moduleId: "medstation", level: 2 }
            ]
          }
        }
      }
    ],
    requiredItems: [],
    team: null,
    lastUpdated: new Date()
  };
}

/**
 * Check if localStorage is available and functional
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__localStorage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): { used: number; available: boolean } {
  if (!isLocalStorageAvailable()) {
    return { used: 0, available: false };
  }

  let used = 0;
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.error("Failed to calculate storage usage:", error);
  }

  return { used, available: true };
}

/**
 * Clear all application data from localStorage
 */
export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
}

// Legacy functions for backward compatibility
export function saveProgress(progress: UserProgress): void {
  saveToLocalStorage(STORAGE_KEYS.PROGRESS, progress);
}

export function loadProgress(): UserProgress | null {
  return loadFromLocalStorage<UserProgress>(STORAGE_KEYS.PROGRESS);
}

export function exportProgress(): string {
  const progress = loadProgress();
  return JSON.stringify(progress, null, 2);
}

export function importProgress(data: string): boolean {
  try {
    const progress = JSON.parse(data);
    saveProgress(progress);
    return true;
  } catch (error) {
    console.error("Failed to import progress:", error);
    return false;
  }
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.TEAM_DATA);
}