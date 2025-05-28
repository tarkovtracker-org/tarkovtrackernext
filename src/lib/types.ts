export type GameMode = "pve" | "pvp";

// Core user profile to hold user-specific settings and preferences
export interface UserProfile {
  id: string;
  name: string;
  displayName?: string;
  currentGameMode: GameMode;
  preferences: {
    theme: "light" | "dark" | "system";
    autoSave: boolean;
    notifications: boolean;
  };
  createdAt: Date;
  lastUpdated: Date;
}

// Generic structure to hold all data for a specific game mode (PvP or PvE)
export interface GameModeData {
  tasks: Task[];
  hideoutModules: HideoutModule[];
  requiredItems: RequiredItem[];
  team: Team | null;
  lastUpdated: Date;
}

// Task/quest details with comprehensive status tracking
export interface Task {
  id: string;
  name: string;
  trader: string;
  map?: string;
  objectives: Objective[];
  status: "locked" | "available" | "active" | "completed";
  requiredItems: RequiredItem[];
  prerequisites: string[]; // IDs of other tasks
  rewards: TaskReward[];
  level: number;
  wiki?: string;
  startedAt?: Date;
  completedAt?: Date;
}

// Individual task objective
export interface Objective {
  id: string;
  description: string;
  type: "kill" | "find" | "extract" | "survive" | "skill" | "custom";
  target?: string;
  count?: number;
  location?: string;
  completed: boolean;
}

// Task rewards
export interface TaskReward {
  type: "xp" | "money" | "item" | "trader_rep";
  amount: number;
  trader?: string;
  item?: string;
}

// Hideout module details with level progression
export interface HideoutModule {
  id: string;
  name: string;
  currentLevel: number;
  maxLevel: number;
  requirementsPerLevel: Record<number, HideoutModuleLevelRequirement>;
  bonuses: string[];
  constructionTime?: string;
  description?: string;
  icon?: string;
}

// Requirements for a specific level of a hideout module
export interface HideoutModuleLevelRequirement {
  requiredPlayerLevel?: number;
  requiredItems: RequiredItem[];
  requiredModules: Array<{
    moduleId: string;
    level: number;
  }>;
  requiredSkills?: Array<{
    skill: string;
    level: number;
  }>;
  requiredTraders?: Array<{
    trader: string;
    level: number;
  }>;
  requiredTasks?: string[]; // Task IDs
}

// Item required for tasks or hideout upgrades
export interface RequiredItem {
  itemId: string;
  name: string;
  quantityNeeded: number;
  quantityFound: number;
  priority: "low" | "medium" | "high";
  sources: string[];
  fir?: boolean; // Found in raid requirement
}

// Aggregated required item for global tracking across tasks and hideout
export interface AggregatedRequiredItem {
  itemId: string;
  name: string;
  totalQuantityNeeded: number;
  totalQuantityFound: number;
  sources: Array<{
    type: "task" | "hideout";
    sourceName: string;
    quantityForSource: number;
    quantityFoundForSource: number;
  }>;
  priority: "low" | "medium" | "high";
  fir?: boolean;
}

// Team structure for local team management
export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  leaderId: string;
  inviteCode: string; // 6-digit invite code
  gameMode: "pve" | "pvp"; // Game mode this team belongs to
  createdAt: Date;
  lastUpdated: Date;
}

// Team member details
export interface TeamMember {
  id: string;
  name: string;
  isSelf: boolean;
  joinedAt: Date;
}

// Additional supporting types for completeness
export interface Item {
  id: string;
  name: string;
  shortName: string;
  category: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  flea: boolean;
  avg24hPrice?: number;
  wikiLink?: string;
  image?: string;
}

export interface Trader {
  id: string;
  name: string;
  image: string;
  description: string;
  location: string;
  levels: TraderLevel[];
}

export interface TraderLevel {
  level: number;
  requiredPlayerLevel: number;
  requiredReputation: number;
  requiredMoney: number;
}

export interface Map {
  id: string;
  name: string;
  description: string;
  image: string;
  size: "small" | "medium" | "large";
  playerCount: string;
  duration: number; // in minutes
}

// Legacy type aliases for backward compatibility (can be removed later)
export type Quest = Task;
export type QuestObjective = Objective;
export type QuestReward = TaskReward;
export type HideoutStation = HideoutModule;
export type HideoutLevel = HideoutModuleLevelRequirement;
export type HideoutRequirement = HideoutModuleLevelRequirement;

// Legacy progress types (can be refactored later)
export interface ModeProgress {
  quests: Record<string, QuestProgress>;
  hideout: Record<string, number>; // stationId -> level
  items: Record<string, RequiredItem>;
}

export interface QuestProgress {
  status: "available" | "active" | "completed" | "failed";
  objectives: Record<string, boolean>;
  startedAt?: Date;
  completedAt?: Date;
}

export interface UserProgress {
  pve: ModeProgress;
  pvp: ModeProgress;
}
