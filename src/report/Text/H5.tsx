// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../../interfaces";
import { cn } from "../../utils";

/**
 * H5 component displays minor subsection headings with small text and an optional icon.
 * @param text - The subsection heading text to display
 * @param icon - Optional icon to display next to the heading
 */
const H5 = memo(({ text, icon }: TextProps) => (
    <h5 className={cn("text-white text-base font-semibold electrolize-regular tracking-wide flex flex-row flex-wrap items-center gap-2 drop-shadow-sm mb-2")}> 
        {text}
        {icon && <span>{icon}</span>}
    </h5>
));

H5.displayName = "H5";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default H5;