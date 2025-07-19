import React from "react";

import { cn } from "../utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = React.memo(
  ({ children, className }: GlassCardProps) => {
    return (
      <div
        className={cn(
          "bg-black/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-500/30",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard; 