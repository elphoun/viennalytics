import { Game, GameDataList } from "../types";

interface OpeningsContextType {
    openings: GameDataList;
    fetchOpenings: () => Promise<void>;
    isLoading: boolean;
    isLoaded: boolean;
}

interface GamesContextType {
    games: Game[];
    fetchGames: () => Promise<void>;
    isLoading: boolean;
    isLoaded: boolean;
}

export type { OpeningsContextType, GamesContextType };