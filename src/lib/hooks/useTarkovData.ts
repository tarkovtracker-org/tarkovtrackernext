"use client";

import { useQuery } from "@apollo/client";
import { useState, useEffect, useMemo } from "react";
import apolloClient from "../apollo-client";
import {
  TARKOV_DATA_QUERY,
  TARKOV_HIDEOUT_QUERY,
  LANGUAGE_QUERY,
} from "../graphql/queries";
import type {
  TarkovDataQueryResult,
  TarkovHideoutQueryResult,
  LanguageQueryResult,
  LanguageCode,
  Task,
  TarkovMap,
  Trader,
  HideoutStation,
  PlayerLevel,
} from "../graphql/types";

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

export function useTarkovData(
  options: UseTarkovDataOptions = {}
): UseTarkovDataReturn {
  const { language = "en", enableTasks = true, enableHideout = true } = options;

  const [availableLanguages, setAvailableLanguages] = useState<string[]>([
    "en",
  ]);
  const [lastQueryTime, setLastQueryTime] = useState<number | null>(null);
  const [lastHideoutQueryTime, setLastHideoutQueryTime] = useState<
    number | null
  >(null);

  // Language query to get available languages
  const { data: languageData } = useQuery<LanguageQueryResult>(LANGUAGE_QUERY, {
    client: apolloClient,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
    onCompleted: (data) => {
      const languages = data?.__type?.enumValues?.map(
        (enumValue) => enumValue.name
      ) ?? ["en"];
      setAvailableLanguages(languages);
    },
    onError: (error) => {
      console.error("Language query failed:", error);
      setAvailableLanguages(["en"]);
    },
  });

  // Main Tarkov data query (tasks, maps, traders, etc.)
  const {
    data: tarkovData,
    loading: tarkovLoading,
    error: tarkovError,
    refetch: refetchTarkovData,
  } = useQuery<TarkovDataQueryResult, { lang: LanguageCode }>(
    TARKOV_DATA_QUERY,
    {
      variables: { lang: language },
      client: apolloClient,
      fetchPolicy: "network-only",
      errorPolicy: "all",
      skip: !enableTasks || !availableLanguages.includes(language),
      onCompleted: (data) => {
        setLastQueryTime(Date.now());
        console.log("🔍 GraphQL Query Completed:");
        console.log(`- Tasks received: ${data?.tasks?.length || 0}`);
        console.log(`- Maps received: ${data?.maps?.length || 0}`);
        console.log(`- Traders received: ${data?.traders?.length || 0}`);
        console.log(
          `- Player levels received: ${data?.playerLevels?.length || 0}`
        );
      },
      onError: (error) => {
        console.error("❌ Tarkov data query failed:", error);
      },
    }
  );

  // Hideout data query
  const {
    data: hideoutData,
    loading: hideoutLoading,
    error: hideoutError,
    refetch: refetchHideoutData,
  } = useQuery<TarkovHideoutQueryResult>(TARKOV_HIDEOUT_QUERY, {
    client: apolloClient,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
    skip: !enableHideout || !availableLanguages.includes(language),
    onCompleted: () => {
      setLastHideoutQueryTime(Date.now());
    },
    onError: (error) => {
      console.error("Hideout data query failed:", error);
    },
  });

  // Refetch functions
  const refetchTasks = () => {
    refetchTarkovData({ lang: language });
  };

  const refetchHideout = () => {
    refetchHideoutData();
  };

  const refetchAll = () => {
    refetchTasks();
    refetchHideout();
  };

  // Processed data with sorting and defaults
  const processedData = useMemo(() => {
    const tasks = tarkovData?.tasks ?? [];
    const maps = [...(tarkovData?.maps ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const traders = [...(tarkovData?.traders ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const playerLevels = tarkovData?.playerLevels ?? [];
    const hideoutStations = hideoutData?.hideoutStations ?? [];

    return {
      tasks,
      maps,
      traders,
      playerLevels,
      hideoutStations,
    };
  }, [tarkovData, hideoutData]);

  // Auto-refetch every 24 hours (like the Vue app)
  useEffect(() => {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();

      // Refetch tasks if they're older than 24 hours
      if (lastQueryTime && now - lastQueryTime > TWENTY_FOUR_HOURS) {
        refetchTasks();
      }

      // Refetch hideout if it's older than 24 hours
      if (
        lastHideoutQueryTime &&
        now - lastHideoutQueryTime > TWENTY_FOUR_HOURS
      ) {
        refetchHideout();
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [lastQueryTime, lastHideoutQueryTime]);

  return {
    // Loading states
    loading: tarkovLoading,
    hideoutLoading,

    // Error states
    error: tarkovError || null,
    hideoutError: hideoutError || null,

    // Data
    tasks: processedData.tasks,
    maps: processedData.maps,
    traders: processedData.traders,
    playerLevels: processedData.playerLevels,
    hideoutStations: processedData.hideoutStations,
    availableLanguages,

    // Metadata
    lastQueryTime,
    lastHideoutQueryTime,

    // Refetch functions
    refetchTasks,
    refetchHideout,
    refetchAll,
  };
}
