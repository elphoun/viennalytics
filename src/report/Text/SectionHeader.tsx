// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../../interfaces";
import { cn } from "../../utils";

/**
 * SectionHeader component displays a styled SectionHeader text with an optional icon.
 * @param text - The SectionHeader text to display
 * @param icon - Optional icon to display next to the SectionHeader
 */
const SectionHeader = memo(({ text, icon }: TextProps) => (
  <h3 className={cn("text-white text-lg font-semibold electrolize-regular tracking-wide flex flex-row flex-wrap items-center gap-2 mb-6 drop-shadow-sm")}>
    {text}
    {icon && <span>{icon}</span>}
  </h3>
));

SectionHeader.displayName = "SectionHeader";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default SectionHeader; 