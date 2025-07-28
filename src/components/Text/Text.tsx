// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo, PropsWithChildren, ReactNode } from "react";

import { cn } from "../utils";

/**
 * Text component for consistent typography styling. Only accepts children.
 * @param children - The text content to display
 */
const Text = memo(({ children }: PropsWithChildren): ReactNode => (
    <span className={cn("indent-4 text-white text-base electrolize-regular")}>
        {children}
    </span>
));
Text.displayName = "Text";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Text;
