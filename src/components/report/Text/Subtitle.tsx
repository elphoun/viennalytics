// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../interfaces";
import { cn } from "../utils";

/**
 * Subtitle component displays a styled subtitle text with an optional icon.
 * @param text - The subtitle text to display
 * @param icon - Optional icon to display next to the subtitle
 */
const Subtitle = memo(({ text, icon }: TextProps) => (
    <h2 className={cn("text-2xl font-bold asul-bold tracking-wide flex flex-row flex-wrap items-center gap-2 drop-shadow-sm")}> 
        {text}
        {icon && <span>{icon}</span>}
    </h2>
));

Subtitle.displayName = "Subtitle";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Subtitle; 