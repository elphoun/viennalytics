import { PropsWithChildren, ReactElement, useMemo, useState, useCallback } from "react";

import { Game } from "../../types";
import { GamesContext } from "../Context";
import { GamesContextType } from "../ContextIntefaces";

// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
const GamesProvider = ({ children }: PropsWithChildren): ReactElement => {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    /**
     * Fetches JSON data from a Vercel Blob URL with caching and loading state.
     * Prevents duplicate requests and provides loading feedback.
     */
    const fetchGames = useCallback(async (): Promise<void> => {
        if (isLoading || isLoaded) { return; }
        setIsLoading(true);
        try {
            const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/processed_all_games-3C5ZRXjhVsokwMupCG8Tp3HmQfqSo3.json');
            if (!response.ok) {
                throw new Error('Failed to fetch games data');
            }
            const gamesList = await response.json();
            setGames(gamesList);
            setIsLoaded(true);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error fetching games:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isLoaded]);

    const value: GamesContextType = useMemo(() => ({
        games,
        fetchGames,
        isLoading,
        isLoaded
    }), [games, fetchGames, isLoading, isLoaded]);

    return (
        <GamesContext.Provider value={value}>
            {children}
        </GamesContext.Provider>
    );
}

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export { GamesProvider };

