// GraphQL Data Types for Tarkov API

export interface TarkovItem {
  id: string;
  shortName?: string;
  name?: string;
  link?: string;
  wikiLink?: string;
  image512pxLink?: string;
  gridImageLink?: string;
  baseImageLink?: string;
  iconLink?: string;
  image8xLink?: string;
  backgroundColor?: string;
}

export interface ItemCategory {
  id: string;
  name: string;
  normalizedName?: string;
  parent?: ItemCategory;
  children?: ItemCategory[];
}

export interface MapPosition {
  x: number;
  y: number;
  z: number;
}

export interface MapWithPosition {
  map: { id: string };
  positions: MapPosition[];
}

export interface TaskZone {
  id: string;
  map: { id: string };
  position: MapPosition;
  outline: MapPosition[];
  top: number;
  bottom: number;
}

export interface ItemRequirement {
  id: string;
  item: TarkovItem;
  count: number;
  quantity: number;
  foundInRaid?: boolean;
}

export interface StationLevelRequirement {
  id: string;
  station: { id: string; name: string };
  level: number;
}

export interface SkillRequirement {
  id: string;
  name: string;
  level: number;
}

export interface TraderRequirement {
  id: string;
  trader: { id: string; name: string };
  value: number;
}

export interface TaskTraderLevelRequirement {
  id: string;
  trader: { id: string; name: string };
  level: number;
}

export interface Craft {
  id: string;
  duration: number;
  requiredItems: ItemRequirement[];
  rewardItems: ItemRequirement[];
}

export interface HideoutLevel {
  id: string;
  level: number;
  description?: string;
  constructionTime: number;
  itemRequirements: ItemRequirement[];
  stationLevelRequirements: StationLevelRequirement[];
  skillRequirements: SkillRequirement[];
  traderRequirements: TraderRequirement[];
  crafts: Craft[];
}

export interface HideoutStation {
  id: string;
  name: string;
  normalizedName?: string;
  levels: HideoutLevel[];
}

export interface TaskObjective {
  id: string;
  description?: string;
  type?: string;
  maps?: { id: string; name: string }[];
  optional?: boolean;
  __typename?: string;
  // Specific objective type fields
  zones?: TaskZone[];
  item?: TarkovItem;
  markerItem?: TarkovItem;
  count?: number;
  foundInRaid?: boolean;
  dogTagLevel?: number;
  maxDurability?: number;
  minDurability?: number;
  playerLevel?: number;
  questItem?: { id: string; name: string };
  shotType?: string;
  targetNames?: string[];
  zoneNames?: string[];
  bodyParts?: string[];
  usingWeapon?: TarkovItem;
  usingWeaponMods?: TarkovItem[];
  wearing?: TarkovItem[];
  notWearing?: TarkovItem[];
  distance?: { compareMethod: string; value: number };
  skillLevel?: { name: string; level: number };
  task?: { id: string; name: string };
  status?: string;
  trader?: { id: string; name: string };
  level?: number;
  useAny?: TarkovItem[];
  containsAll?: TarkovItem[];
  containsCategory?: ItemCategory;
  attributes?: Array<{
    name: string;
    requirement: { compareMethod: string; value: number };
  }>;
  healthEffect?: {
    bodyParts: string[];
    effects: string[];
    time: { compareMethod: string; value: number };
  };
  playerHealthEffect?: {
    bodyParts: string[];
    effects: string[];
    time: { compareMethod: string; value: number };
  };
  enemyHealthEffect?: {
    bodyParts: string[];
    effects: string[];
    time: { compareMethod: string; value: number };
  };
  exitStatus?: string;
  possibleLocations?: MapWithPosition[];
}

export interface TaskRequirement {
  task: { id: string; name?: string };
  status?: string[];
}

export interface TraderStanding {
  trader: { id: string; name: string };
  standing: number;
}

export interface ItemReward {
  count: number;
  item: TarkovItem & {
    containsItems?: Array<{
      item: TarkovItem;
      count: number;
    }>;
  };
}

export interface OfferUnlock {
  id: string;
  trader: { id: string; name: string };
  level: number;
  item: TarkovItem & {
    containsItems?: Array<{
      count: number;
      item: TarkovItem;
    }>;
  };
}

export interface SkillLevelReward {
  name: string;
  level: number;
}

export interface TraderUnlock {
  id: string;
  name: string;
}

export interface TaskRewards {
  traderStanding?: TraderStanding[];
  items?: ItemReward[];
  offerUnlock?: OfferUnlock[];
  skillLevelReward?: SkillLevelReward[];
  traderUnlock?: TraderUnlock[];
}

export interface NeededKey {
  keys: TarkovItem[];
  map: { id: string; name: string };
}

export interface Task {
  id: string;
  tarkovDataId?: number;
  name?: string;
  trader?: { id: string; name: string; imageLink?: string };
  map?: { id: string; name: string };
  kappaRequired?: boolean;
  lightkeeperRequired?: boolean;
  experience?: number;
  wikiLink?: string;
  minPlayerLevel?: number;
  taskRequirements?: TaskRequirement[];
  traderRequirements?: TraderRequirement[];
  objectives?: TaskObjective[];
  startRewards?: TaskRewards;
  finishRewards?: TaskRewards;
  factionName?: string;
  neededKeys?: NeededKey[];
}

export interface TarkovMap {
  id: string;
  name: string;
  tarkovDataId?: number;
  enemies?: string[];
  wiki?: string;
  raidDuration?: number;
  players?: string;
  description?: string;
}

export interface PlayerLevel {
  level: number;
  exp: number;
  levelBadgeImageLink: string;
}

export interface TraderLevel {
  id: string;
  level: number;
  requiredPlayerLevel: number;
  requiredReputation: number;
  requiredCommerce: number;
  insuranceRate?: number;
  payRate?: number;
  repairCostMultiplier?: number;
}

export interface Trader {
  id: string;
  name: string;
  resetTime?: string;
  imageLink?: string;
  levels: TraderLevel[];
}

// Query result types
export interface LanguageQueryResult {
  __type?: {
    enumValues: Array<{ name: string }>;
  };
}

export interface TarkovDataQueryResult {
  tasks: Task[];
  maps: TarkovMap[];
  traders: Trader[];
  playerLevels: PlayerLevel[];
}

export interface TarkovHideoutQueryResult {
  hideoutStations: HideoutStation[];
}

// Language code type
export type LanguageCode = "en" | "ru" | "de" | "fr" | "es" | "zh" | "cs";
