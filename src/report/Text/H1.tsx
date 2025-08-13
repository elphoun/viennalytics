// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../../interfaces";
import { cn } from "../../utils";

/**
 * H1 component displays the main document title with large, styled text and an optional icon.
 * @param text - The title text to display
 * @param icon - Optional icon to display next to the title
 */
const H1 = memo(({ text, icon }: TextProps) => (
  <h1 className={cn("text-orange-400 text-5xl asul-bold mb-2 flex items-center gap-2")}>
    {text}
    {icon && <span>{icon}</span>}
  </h1>
));
H1.displayName = "H1";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default H1; 