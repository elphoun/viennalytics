// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { cn } from "../utils";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface StatItemProps {
  label: string;
  value: string;
  className?: string;
}

/**
 * StatItem component displays a label-value pair in a flex layout.
 * @param label - The label text to display
 * @param value - The value text to display
 * @param className - Additional CSS classes to apply
 */
const StatItem = ({ label, value, className = "" }: StatItemProps) => (
  <div className={cn("flex justify-between", className)}>
    <p>{label}</p>
    <p className="text-orange-300">{value}</p>
  </div>
);

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default StatItem;