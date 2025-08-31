'use client';

import { useQuery } from '@tanstack/react-query';
import { platformAPI, type Feature, type Level, type PlatformStats } from '@/api/platform';
import { queryKeys } from '@/lib/queryKeys';

// Platform features query
export const usePlatformFeatures = () => {
  return useQuery<Feature[], Error>({
    queryKey: [...queryKeys.platform.all, 'features'] as const,
    queryFn: () => platformAPI.getFeatures(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Platform levels query
export const usePlatformLevels = () => {
  return useQuery<Level[], Error>({
    queryKey: [...queryKeys.platform.all, 'levels'] as const,
    queryFn: () => platformAPI.getLevels(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};

// Platform statistics query
export const usePlatformStats = () => {
  return useQuery<PlatformStats, Error>({
    queryKey: queryKeys.platform.stats(),
    queryFn: () => platformAPI.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};