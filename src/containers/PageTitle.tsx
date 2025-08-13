// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../interfaces";
import { cn } from "../utils";

/**
 * PageTitle component displays a page-level title with centered styling and an optional icon.
 * Uses h2 to maintain proper heading hierarchy under the main document title.
 * @param text - The title text to display
 * @param icon - Optional icon to display next to the title
 */
const PageTitle = memo(({ text, icon }: TextProps) => (
    <h2 className={cn("text-center w-full text-white text-3xl asul-bold flex items-center justify-center gap-5")}> 
        {text}
        {icon && <span>{icon}</span>}
    </h2>
));
PageTitle.displayName = "PageTitle";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default PageTitle; 