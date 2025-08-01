// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { createContext } from "react";

import { OpeningsContextType } from "./ContextIntefaces";

/** OpeningsContext stores the openings in a local context */
const OpeningsContext = createContext<OpeningsContextType>({
    openings: [],
    fetchOpenings: async () => { },
    isLoading: false,
    isLoaded: false,
});
OpeningsContext.displayName = 'OpeningsContext'

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export {
    OpeningsContext
};

