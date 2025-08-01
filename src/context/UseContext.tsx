// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { useContext } from "react";

import { OpeningsContext } from "./Context";

/**
 * @description useOpenings returns the OpeningsContext value
 * @throws Error if used outside OpeningsProvider
 */
const useOpenings = () => {
    const context = useContext(OpeningsContext);
    return context;
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export {
    useOpenings
}