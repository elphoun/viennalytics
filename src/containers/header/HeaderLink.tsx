// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { ReactNode, memo } from "react";

import { cn } from "../../utils";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface ClickProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

/**
 * HeaderLink component renders a clickable navigation link with icon and label.
 * @param icon - The icon to display
 * @param label - The text label for the link
 * @param onClick - Function to call when the link is clicked
 */
const HeaderLink = memo(({ icon, label, onClick }: ClickProps) => (
  <button 
    type="button" 
    className={cn(
      'flex items-center gap-3 text-md font-semibold transition-all cursor-pointer',
      'duration-600 rounded-xl hover:brightness-50'
    )} 
    onClick={onClick}
  >
    <span className={cn('hidden md:block')}>{label}</span>
    {icon}
  </button>
));
HeaderLink.displayName = "HeaderLink";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default HeaderLink;