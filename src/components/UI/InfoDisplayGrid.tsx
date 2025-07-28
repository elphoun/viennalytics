// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import React from "react";
import { FaInfoCircle } from "react-icons/fa";

import { cn } from "../utils";

// ─ Helper Functions ─────────────────────────────────────────────────────────────────────────────

/**
 * Props for InfoDisplayGrid component.
 * @property title - The main title to display
 * @property smallTitle - Optional smaller title for compact views
 * @property help - Help text for the info icon
 * @property className - Additional CSS classes
 * @property children - Content to display inside the grid
 */
interface InfoDisplayGridProps {
  title: string;
  smallTitle?: string;
  help: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * InfoDisplayGrid component displays a styled grid section with a title, help icon, and content.
 * @param title - The main title to display
 * @param smallTitle - Optional smaller title for compact views
 * @param help - Help text for the info icon
 * @param className - Additional CSS classes
 * @param children - Content to display inside the grid
 */
const InfoDisplayGrid = ({ title, smallTitle, help, className, children }: InfoDisplayGridProps) => {
  const displayTitle = smallTitle || title;

  return (
    <div
      className={cn(
        "relative group bg-white/10 backdrop-blur-sm border-2 border-amber-400/50 w-full flex flex-col items-center justify-center h-fit rounded-lg p-1",
        className
      )}
    >
      <div className="w-full bg-black/40 flex items-center justify-center p-1 rounded relative">
        <span className="text-xs sm:text-sm text-center w-full font-semibold pr-5 truncate leading-tight text-neutral-100">
          <span className="hidden sm:inline">{title}</span>
          <span className="sm:hidden">{displayTitle}</span>
        </span>
        <FaInfoCircle title={help} className="absolute top-1/2 -translate-y-1/2 right-1.5 cursor-help w-3.5 h-3.5 text-gray-400 hover:text-amber-400 transition-colors flex-shrink-0" />
      </div>
      <div className="w-full flex-1 flex items-center justify-center p-1 text-center min-h-0">
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default InfoDisplayGrid; 