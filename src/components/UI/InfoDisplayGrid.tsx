import React from "react";
import { FaInfoCircle } from "react-icons/fa";

import { cn } from "../utils";

interface InfoDisplayGridProps {
  title: string;
  smallTitle?: string;
  help: string;
  className?: string;
  children: React.ReactNode;
}

const InfoDisplayGrid = ({ title, smallTitle, help, className, children }: InfoDisplayGridProps) => (
  <div
    className={cn(
      "relative bg-orange-200/15 ring-2 ring-amber-200/50 p-2 w-full flex flex-col items-center justify-center",
      className
    )}
  >
    <div className="sticky top-0 z-10 w-full bg-orange-200/30 flex items-center justify-center py-1 mb-2 rounded">
      <span className="text-base text-center w-full font-semibold">
        <span className="hidden sm:inline">{title}</span>
        {smallTitle && <span className="sm:hidden">{smallTitle}</span>}
      </span>
      <FaInfoCircle title={help} className="absolute top-1 right-1 cursor-help max-h-3" />
    </div>
    <div className="w-full flex-1 overflow-y-auto max-h-[60vh] px-1">
      {children}
    </div>
  </div>
);

export default InfoDisplayGrid; 