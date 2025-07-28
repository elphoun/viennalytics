// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../interfaces";
import { cn } from "../utils";

/**
 * Title component displays a large, styled title text with an optional icon.
 * @param text - The title text to display
 * @param icon - Optional icon to display next to the title
 */
const Title = memo(({ text, icon }: TextProps) => (
    <h1 className={cn("text-white text-3xl asul-bold mb-2 flex items-center gap-5")}> 
        {text}
        {icon && <span>{icon}</span>}
    </h1>
));

Title.displayName = "Title";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Title; 