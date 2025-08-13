// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo, ReactElement } from "react";

import { cn } from "../../utils";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface HighlightProps {
  color?: string;
  text: string;
  icon?: ReactElement;
}

/**
 * Highlight component renders highlighted text with optional color and icon.
 * @param color - CSS color class to apply to the highlight
 * @param text - The text to highlight
 * @param icon - Optional icon to display before the text
 */
const Highlight = memo(({ color = "bg-orange-400/20 text-orange-300 border-orange-400/30", text, icon }: HighlightProps): ReactElement => (
  <>
    {' '}
    <span className={cn('inline-block px-1 rounded font-semibold text-sm indent-0 border', color)}>
      {icon && <span className="mr-1 align-text-bottom">{icon}</span>}
      {text}
    </span>
  </>
));
Highlight.displayName = "Highlight";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Highlight;