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
    <h1 className={cn("text-center w-full text-white text-3xl asul-bold flex items-center justify-center gap-5")}> 
        {text}
        {icon && <span>{icon}</span>}
    </h1>
));
Title.displayName = "Title";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Title; 