import { memo, ReactNode } from "react";

import { cn } from "@/app/utils";
import H3 from "./H3";

interface DataCardProps {
  title: string;
  children: ReactNode;
}

const DataCard = memo(({ title, children }: DataCardProps) => (
  <div
    className={cn(
      "bg-white/5 px-4 py-3 space-y-3 rounded-lg transition-all duration-200 shadow-md bg-gradient-to-br from-gray-950/50 to-gray-900/90 border border-blue-400/30 hover:scale-[1.01] hover:border-blue-300/60 min-h-fit flex-1",
    )}
  >
    <H3 text={title} />
    {children}
  </div>
));

DataCard.displayName = "DataCard";

export default DataCard;
