// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { createContext } from "react";

import { GamesContextType, OpeningsContextType } from "./ContextIntefaces";

// ─ Helper Functions ─────────────────────────────────────────────────────────────────────────────

/** OpeningsContext stores the openings in a local context */
const OpeningsContext = createContext<OpeningsContextType>({
    openings: [],
    fetchOpenings: async () => { },
    isLoading: false,
    isLoaded: false,
});
OpeningsContext.displayName = 'OpeningsContext'

/** GamesContext stores the games in a local context */
const GamesContext = createContext<GamesContextType>({
    games: [],
    fetchGames: async () => { },
    isLoading: false,
    isLoaded: false,
});
GamesContext.displayName = 'GamesContext'

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export {
    OpeningsContext,
    GamesContext
};

