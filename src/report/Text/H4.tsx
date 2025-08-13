// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../../interfaces";
import { cn } from "../../utils";

/**
 * H4 component displays subsection headers within report sections with smaller text and an optional icon.
 * @param text - The subsection header text to display
 * @param icon - Optional icon to display next to the header
 */
const H4 = memo(({ text, icon }: TextProps) => (
  <h4 className={cn("text-white text-lg font-semibold electrolize-regular tracking-wide flex flex-row flex-wrap items-center gap-2 drop-shadow-sm")}>
    {text}
    {icon && <span>{icon}</span>}
  </h4>
));

H4.displayName = "H4";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default H4; 