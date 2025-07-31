// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import React, { memo } from "react";

import { cn } from "../utils";

// ─ Helper Functions ─────────────────────────────────────────────────────────────────────────────

/**
 * Props for GlassCard component.
 * @property children - Content to display inside the card
 * @property className - Additional CSS classes
 */
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * GlassCard component displays a glassmorphic styled card for wrapping content.
 * @param children - Content to display inside the card
 * @param className - Additional CSS classes
 */
const GlassCard = memo(({ children, className }: GlassCardProps) => (
  <div
    className={cn(
      "bg-black/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-500/30",
      className
    )}
  >
    {children}
  </div>
));

GlassCard.displayName = "GlassCard";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default GlassCard; 