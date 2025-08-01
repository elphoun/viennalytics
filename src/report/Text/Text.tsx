// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo, PropsWithChildren, ReactNode } from "react";

import { cn } from "../../utils";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface TextProps extends PropsWithChildren {
  className?: string;
}

/**
 * Text component for consistent typography styling throughout the report.
 * @param children - The text content to display
 * @param className - Optional additional CSS classes
 */
const Text = memo(({ children, className }: TextProps): ReactNode => (
  <p className={cn("text-white text-base leading-relaxed mb-4", className)}>
    {children}
  </p>
));
Text.displayName = "Text";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Text;