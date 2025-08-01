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
    <span
      className={cn('inline-flex text-center px-2 py-0.5 rounded font-semibold text-sm indent-0 border', color)}
    >
      {icon && <span className="mr-1 flex items-center">{icon}</span>}
      {text}
    </span>
    {' '}
  </>
));
Highlight.displayName = "Highlight";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Highlight;