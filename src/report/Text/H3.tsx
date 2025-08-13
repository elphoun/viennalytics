// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../../interfaces";
import { cn } from "../../utils";

/**
 * H3 component displays section titles within the report with medium-sized text and an optional icon.
 * @param text - The section title text to display
 * @param icon - Optional icon to display next to the title
 */
const H3 = memo(({ text, icon }: TextProps) => (
    <h3 className={cn("text-white text-2xl font-bold asul-bold tracking-wide flex flex-row flex-wrap items-center gap-2 drop-shadow-sm mb-3")}> 
        {text}
        {icon && <span>{icon}</span>}
    </h3>
));

H3.displayName = "H3";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default H3; 