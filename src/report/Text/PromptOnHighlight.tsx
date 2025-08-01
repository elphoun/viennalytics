// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo, ReactNode } from "react";

import { cn } from "../../utils";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface PromptOnHighlightProps {
  children: ReactNode;
  prompt: ReactNode;
  className?: string;
}

/**
 * PromptOnHighlight component displays text with a hover tooltip prompt.
 * @param children - The content to display
 * @param prompt - The tooltip content to show on hover
 * @param className - Additional CSS classes to apply
 */
const PromptOnHighlight = memo(({
  children,
  prompt,
  className = "",
}: PromptOnHighlightProps) => (
  <>
    {" "}
    <span
      className={cn(
        "indent-0 relative cursor-pointer transition-transform",
        "hover:animate-wiggle text-orange-300 font-semibold group",
        className
      )}
    >
      {children}
      <span className={cn(
        "absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max text-xs rounded",
        "bg-orange-400 text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity",
        "pointer-events-none z-10 shadow-lg indent-0 font-medium"
      )}>
        {prompt}
      </span>
    </span>
    {" "}
  </>
));
PromptOnHighlight.displayName = "PromptOnHighlight";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default PromptOnHighlight;
