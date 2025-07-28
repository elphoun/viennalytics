// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { useContext } from "react";

import { GamesContext, OpeningsContext } from "./Context";

/**
 * @description useOpenings returns the OpeningsContext value
 * @throws Error if used outside OpeningsProvider
 */
const useOpenings = () => {
    const context = useContext(OpeningsContext);
    return context;
};

/**
 * @description useGames returns the OpeningsContext value
 * @throws Error if used outside OpeningsProvider
 */
const useGames = () => {
    const context = useContext(GamesContext);
    return context;
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export {
    useOpenings,
    useGames
}