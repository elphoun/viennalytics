// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo, PropsWithChildren, ReactNode } from "react";

import { cn } from "../../utils";

interface ParagraphProps extends PropsWithChildren {
  className?: string;
}

/**
 * Paragraph component for consistent typography styling.
 * @param children - The Paragraph content to display
 * @param className - Optional additional CSS classes
 */
const Paragraph = memo(({ children, className }: ParagraphProps): ReactNode => (
  <span className={cn("indent-4 text-white space-x-2 text-base electrolize-regular", className)}>
    {children}
  </span>
));
Paragraph.displayName = "Paragraph";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Paragraph;
