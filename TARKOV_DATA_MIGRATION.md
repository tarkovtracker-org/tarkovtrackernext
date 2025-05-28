# Tarkov Data Migration Documentation

This document outlines the migration of data fetching logic from the [TarkovTracker Vue app](https://github.com/tarkovtracker-org/TarkovTracker) to this Next.js project.

## Overview

The migration includes:

- GraphQL queries for fetching Tarkov data from `https://api.tarkov.dev/graphql`
- Apollo Client setup with caching and automatic refetching
- TypeScript interfaces for type safety
- React hooks for data management
- Utility functions for data processing

## Architecture

### 1. Apollo Client Setup (`src/lib/apollo-client.ts`)

- Configured to connect to the Tarkov GraphQL API
- Implements 24-hour cache policy
- Handles timeout and error policies

### 2. GraphQL Queries (`src/lib/graphql/queries.ts`)

- **TARKOV_DATA_QUERY**: Fetches tasks, maps, traders, and player levels
- **TARKOV_HIDEOUT_QUERY**: Fetches hideout stations and upgrade requirements
- **LANGUAGE_QUERY**: Fetches available language codes
- Includes comprehensive fragments for reusable data structures

### 3. TypeScript Types (`src/lib/graphql/types.ts`)

- Complete type definitions for all GraphQL data structures
- Interfaces for tasks, items, hideout stations, maps, traders, etc.
- Type-safe query result interfaces

### 4. React Hook (`src/lib/hooks/useTarkovData.ts`)

- Equivalent to the Vue `useTarkovData` composable
- Provides reactive data fetching with loading states
- Automatic 24-hour refetch cycle
- Language support and error handling

### 5. Utility Functions (`src/lib/utils/tarkov-utils.ts`)

- Data filtering and processing functions
- Task and hideout management utilities
- Experience calculation and progress tracking

## Key Features Migrated

### Data Fetching

- ✅ GraphQL queries with Apollo Client
- ✅ Automatic caching and cache invalidation
- ✅ 24-hour automatic refetch cycle
- ✅ Language support (en, ru, de, fr, es, zh, cs)
- ✅ Error handling and loading states

### Data Processing

- ✅ Task filtering by trader, map, level
- ✅ Kappa and Lightkeeper task identification
- ✅ Required items extraction
- ✅ Experience calculation
- ✅ Hideout upgrade requirements
- ✅ Progress tracking utilities

### Type Safety

- ✅ Complete TypeScript interfaces
- ✅ Type-safe GraphQL queries
- ✅ Strongly typed React hooks

## Usage Examples

### Basic Data Fetching

```tsx
import { useTarkovData } from '@/lib/hooks/useTarkovData';

function MyComponent() {
  const {
    loading,
    error,
    tasks,
    maps,
    traders,
    hideoutStations,
    refetchAll
  } = useTarkovData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Tasks: {tasks.length}</h1>
      <h1>Maps: {maps.length}</h1>
      <h1>Traders: {traders.length}</h1>
      <button onClick={refetchAll}>Refresh Data</button>
    </div>
  );
}
```

### Data Processing

```tsx
import { 
  filterTasksByTrader, 
  getKappaTasks, 
  getRequiredItemsFromTasks 
} from '@/lib/utils/tarkov-utils';

function TaskAnalysis() {
  const { tasks } = useTarkovData();
  
  const prapotTasks = filterTasksByTrader(tasks, 'prapor');
  const kappaTasks = getKappaTasks(tasks);
  const requiredItems = getRequiredItemsFromTasks(tasks);
  
  return (
    <div>
      <p>Prapor Tasks: {prapotTasks.length}</p>
      <p>Kappa Tasks: {kappaTasks.length}</p>
      <p>Required Items: {requiredItems.length}</p>
    </div>
  );
}
```

### Language Support

```tsx
function MultiLanguageComponent() {
  const { 
    tasks: englishTasks 
  } = useTarkovData({ language: 'en' });
  
  const { 
    tasks: russianTasks 
  } = useTarkovData({ language: 'ru' });
  
  return (
    <div>
      <h2>English Tasks: {englishTasks.length}</h2>
      <h2>Russian Tasks: {russianTasks.length}</h2>
    </div>
  );
}
```

## Demo

Visit `/demo` to see the migrated data in action. The demo page showcases:

- Real-time data fetching from the Tarkov API
- All data types (tasks, maps, traders, hideout, levels)
- Loading states and error handling
- Data refresh functionality

## Differences from Vue Implementation

### Framework-Specific Changes

- **Vue Composables** → **React Hooks**
- **Vue Apollo Composable** → **Apollo Client React Hooks**
- **Pinia Store** → **React State Management** (can be extended with Zustand/Redux)

### Improvements

- Better TypeScript integration
- More comprehensive error handling
- Cleaner separation of concerns
- Enhanced utility functions

### Maintained Features

- Same GraphQL queries and data structure
- 24-hour cache policy
- Language support
- Automatic refetching
- Error handling

## Next Steps

1. **State Management**: Implement user progress tracking (similar to Vue app's Pinia stores)
2. **Local Storage**: Add persistence for user data
3. **Team Features**: Implement team synchronization
4. **UI Components**: Create task and hideout tracking components
5. **Offline Support**: Add service worker for offline functionality

## API Reference

### useTarkovData Hook

```typescript
interface UseTarkovDataOptions {
  language?: LanguageCode;
  enableTasks?: boolean;
  enableHideout?: boolean;
}

interface UseTarkovDataReturn {
  // Loading states
  loading: boolean;
  hideoutLoading: boolean;
  
  // Error states
  error: Error | null;
  hideoutError: Error | null;
  
  // Data
  tasks: Task[];
  maps: TarkovMap[];
  traders: Trader[];
  playerLevels: PlayerLevel[];
  hideoutStations: HideoutStation[];
  availableLanguages: string[];
  
  // Metadata
  lastQueryTime: number | null;
  lastHideoutQueryTime: number | null;
  
  // Refetch functions
  refetchTasks: () => void;
  refetchHideout: () => void;
  refetchAll: () => void;
}
```

### Key Utility Functions

- `filterTasksByTrader(tasks, traderId)` - Filter tasks by trader
- `filterTasksByMap(tasks, mapId)` - Filter tasks by map
- `getKappaTasks(tasks)` - Get Kappa-required tasks
- `getRequiredItemsFromTasks(tasks)` - Extract required items
- `calculateTotalExperience(tasks, completedIds)` - Calculate XP
- `getAvailableTasks(tasks, level, completed)` - Get available tasks

## Migration Status

- ✅ **Complete**: GraphQL queries and types
- ✅ **Complete**: Apollo Client setup
- ✅ **Complete**: React hooks for data fetching
- ✅ **Complete**: Utility functions
- ✅ **Complete**: Demo implementation
- 🔄 **In Progress**: User progress tracking
- 📋 **Planned**: Team features
- 📋 **Planned**: UI components for task tracking
