// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo, PropsWithChildren, ReactNode } from "react";

import { cn } from "../utils";

interface TextProps extends PropsWithChildren {
  className?: string;
}

/**
 * Text component for consistent typography styling.
 * @param children - The text content to display
 * @param className - Optional additional CSS classes
 */
const Text = memo(({ children, className }: TextProps): ReactNode => (
    <span className={cn("indent-4 text-white text-base electrolize-regular", className)}>
        {children}
    </span>
));
Text.displayName = "Text";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Text;
