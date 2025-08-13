// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../../interfaces";
import { cn } from "../../utils";

/**
 * H2 component displays major section headings with large text and an optional icon.
 * @param text - The section heading text to display
 * @param icon - Optional icon to display next to the heading
 */
const H2 = memo(({ text, icon }: TextProps) => (
    <h2 className={cn("text-white text-3xl font-bold asul-bold tracking-wide flex flex-row flex-wrap items-center gap-2 drop-shadow-sm mb-4")}> 
        {text}
        {icon && <span>{icon}</span>}
    </h2>
));

H2.displayName = "H2";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default H2;