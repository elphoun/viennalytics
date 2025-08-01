// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { GameDataList } from "../types";

// ─ Interfaces ───────────────────────────────────────────────────────────────────────────────────
interface OpeningsContextType {
    openings: GameDataList;
    fetchOpenings: () => Promise<void>;
    isLoading: boolean;
    isLoaded: boolean;
}

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export type { OpeningsContextType };