import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { OpeningStats } from '../types';

const DATABASE_URL =
  'https://6sf2y06qu1484byz.public.blob.vercel-storage.com/opening_stats.json';

export const useOpeningStats = (): UseQueryResult<OpeningStats, Error> => {
  return useQuery({
    queryKey: ['openingStats'],
    queryFn: async ({ signal }) => {
      const response = await fetch(DATABASE_URL, { signal });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    },
    staleTime: Infinity, // Chess data never goes stale
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
};
