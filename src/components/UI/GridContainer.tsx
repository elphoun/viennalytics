import React, { memo } from "react";

import { cn } from "../utils";

interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
}

const GridContainer = memo(({ children, className }: GridContainerProps) => (
  <div className={cn("w-full h-full p-2 rounded-lg bg-white/15 ring-1", className)}>
    {children}
  </div>
));

GridContainer.displayName = "GridContainer";

export default GridContainer; 