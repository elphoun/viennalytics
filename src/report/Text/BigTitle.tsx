// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../../interfaces";
import { cn } from "../../utils";

/**
 * BigTitle component displays a large, styled title text with an optional icon.
 * @param text - The title text to display
 * @param icon - Optional icon to display next to the title
 */
const BigTitle = memo(({ text, icon }: TextProps) => (
  <h1 className={cn("text-orange-400 text-5xl asul-bold mb-2 flex items-center gap-2")}>
    {text}
    {icon && <span>{icon}</span>}
  </h1>
));
BigTitle.displayName = "BigTitle";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default BigTitle; 