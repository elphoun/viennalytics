// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../../interfaces";
import { cn } from "../../utils";

/**
 * H6 component displays the smallest heading level with minimal styling and an optional icon.
 * @param text - The heading text to display
 * @param icon - Optional icon to display next to the heading
 */
const H6 = memo(({ text, icon }: TextProps) => (
    <h6 className={cn("text-white text-sm font-medium electrolize-regular tracking-wide flex flex-row flex-wrap items-center gap-2 drop-shadow-sm mb-1")}> 
        {text}
        {icon && <span>{icon}</span>}
    </h6>
));

H6.displayName = "H6";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default H6;