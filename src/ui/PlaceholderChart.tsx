// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import Paragraph from "../report/Text/Paragraph";
import { cn } from "../utils";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface PlaceholderChartProps {
  icon: string;
  title: string;
  width?: string;
  height?: string;
  className?: string;
}

/**
 * PlaceholderChart component displays a placeholder for charts with an icon and title.
 * @param icon - The icon to display in the placeholder
 * @param title - The title text to display
 * @param width - Width class for the icon container
 * @param height - Height class for the icon container
 * @param className - Additional CSS classes to apply
 */
const PlaceholderChart = ({
  icon,
  title,
  width = "w-32",
  height = "h-32",
  className = ""
}: PlaceholderChartProps) => (
  <div className={cn("bg-white/5 p-6 rounded-lg flex items-center justify-center", className)}>
    <div className="text-center">
      <div className={cn(width, height, "bg-orange-400/20 rounded-lg mb-4 mx-auto flex items-center justify-center")}>
        <Paragraph>{icon}</Paragraph>
      </div>
      <Paragraph>{title}</Paragraph>
    </div>
  </div>
);

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default PlaceholderChart;