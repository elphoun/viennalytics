// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { PropsWithChildren, ReactElement, useMemo, useState, useCallback } from "react";

import { GameDataList } from "../../types";
import { OpeningsContext } from "../Context";
import { OpeningsContextType } from "../ContextInterfaces";

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
      // Fallback to mock data if fetch fails
      const mockOpenings = [
        {
          opening: "Sicilian Defense",
          variations: [
            {
              variation: "Accelerated Dragon",
              openingMoves: ["e4", "c5", "Nf3", "g6"],
              fen: "rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
              openingEval: -0.2,
              totalGames: 500,
              winPercentageWhite: 45.2,
              winPercentageBlack: 42.8,
              drawPercentage: 12.0,
              averageMoves: 42,
              strongestPlayer: "Magnus Carlsen",
              popularNextMoves: [],
              playerElos: [],
              moveList: ["e4", "c5", "Nf3", "g6"],
              numMoves: 4,
              topGames: []
            }
          ]
        },
        {
          opening: "French Defense",
          variations: [
            {
              variation: "Classical Variation",
              openingMoves: ["e4", "e6", "d4", "d5"],
              fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
              openingEval: 0.3,
              totalGames: 400,
              winPercentageWhite: 48.1,
              winPercentageBlack: 39.9,
              drawPercentage: 12.0,
              averageMoves: 38,
              strongestPlayer: "Fabiano Caruana",
              popularNextMoves: [],
              playerElos: [],
              moveList: ["e4", "e6", "d4", "d5"],
              numMoves: 4,
              topGames: []
            }
          ]
        },
        {
          opening: "Caro-Kann Defense",
          variations: [
            {
              variation: "Classical Variation",
              openingMoves: ["e4", "c6", "d4", "d5"],
              fen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
              openingEval: 0.1,
              totalGames: 350,
              winPercentageWhite: 46.5,
              winPercentageBlack: 41.2,
              drawPercentage: 12.3,
              averageMoves: 40,
              strongestPlayer: "Ding Liren",
              popularNextMoves: [],
              playerElos: [],
              moveList: ["e4", "c6", "d4", "d5"],
              numMoves: 4,
              topGames: []
            }
          ]
        }
      ];
      setOpenings(mockOpenings);
      setIsLoaded(true);
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

