// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { cn } from "../../utils";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface QuoteProps {
  quote: string;
  author: string;
  className?: string;
}

/**
 * Quote component displays a styled blockquote with author attribution.
 * @param quote - The quote text to display
 * @param author - The author of the quote
 * @param className - Additional CSS classes to apply
 */
const Quote = memo(({ quote, author, className = "" }: QuoteProps) => (
  <div className={cn("bg-gray-800/50 border-l-4 border-orange-400 p-3 rounded-r-lg max-w-sm", className)}>
    <blockquote className="italic text-white/90 text-sm leading-relaxed break-words whitespace-normal">
      &ldquo;{quote}&rdquo;
    </blockquote>
    <cite className="block text-orange-300/80 text-xs mt-2 font-medium">
      — {author}
    </cite>
  </div>
));
Quote.displayName = "Quote";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Quote;