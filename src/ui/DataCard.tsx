// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { ReactElement, ReactNode } from "react";

import { cn } from "../utils";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface DataCardProps {
  title: string | ReactElement;
  children: ReactNode;
  className?: string;
}

/**
 * DataCard component renders a styled card with a title and content.
 * @param title - The title to display at the top of the card
 * @param children - The content to display in the card body
 * @param className - Additional CSS classes to apply
 */
const DataCard = ({ title, children, className }: DataCardProps) => (
  <div className={cn("bg-white/5 px-4 py-3 rounded-lg transition-all duration-200 shadow-md", className)}>
    <h3 className="text-lg font-semibold text-orange-300 mb-1">{title}</h3>
    {children}
  </div>
);

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default DataCard;