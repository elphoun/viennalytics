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

const InfoDisplayGrid = ({ title, smallTitle, help, className, children }: InfoDisplayGridProps) => {
  const displayTitle = smallTitle || title;
  
  return (
    <div
      className={cn(
        "relative bg-orange-200/15 ring-2 ring-amber-200/50 p-1 sm:p-2 w-full flex flex-col items-center justify-center min-h-[80px]",
        className
      )}
    >
      <div className="w-full bg-orange-200/30 flex items-center justify-center py-1 px-2 mb-1 rounded relative">
        <span className="text-xs sm:text-sm text-center w-full font-semibold pr-5 truncate leading-tight">
          <span className="hidden sm:inline">{title}</span>
          <span className="sm:hidden">{displayTitle}</span>
        </span>
        <FaInfoCircle title={help} className="absolute top-1/2 -translate-y-1/2 right-1 cursor-help w-3 h-3 text-gray-600 flex-shrink-0" />
      </div>
      <div className="w-full flex-1 flex items-center justify-center px-1 text-center min-h-0">
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InfoDisplayGrid; 