// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { PropsWithChildren, ReactElement, useMemo, useState, useCallback } from "react";

import { GameDataList } from "../../types";
import { OpeningsContext } from "../Context";
import { OpeningsContextType } from "../ContextIntefaces";

/**
 * OpeningsProvider component provides chess openings data through React context.
 * Manages loading state and prevents duplicate API requests.
 * @param children - Child components that will have access to the openings context
 */
const OpeningsProvider = ({ children }: PropsWithChildren): ReactElement => {
  const [openings, setOpenings] = useState<GameDataList>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Fetches JSON data from a Vercel Blob URL with caching and loading state.
   * Prevents duplicate requests and provides loading feedback.
   */
  const fetchOpenings = useCallback(async (): Promise<void> => {
    // Prevent duplicate requests
    if (isLoading || isLoaded) { 
      return; 
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/opening_stats.json');
      if (!response.ok) { 
        throw new Error('Failed to fetch openings data'); 
      }
      const openingList = await response.json();
      setOpenings(openingList);
      setIsLoaded(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching openings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isLoaded]);

  const value: OpeningsContextType = useMemo(() => ({
    openings,
    fetchOpenings,
    isLoading,
    isLoaded
  }), [openings, fetchOpenings, isLoading, isLoaded]);

  return (
    <OpeningsContext.Provider value={value}>
      {children}
    </OpeningsContext.Provider>
  );
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export { OpeningsProvider };

