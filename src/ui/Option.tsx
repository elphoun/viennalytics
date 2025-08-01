// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { cn } from "../utils";

// ─ Helper Functions ─────────────────────────────────────────────────────────────────────────────

/**
 * OptionType defines the structure for dropdown/select options.
 * @property value - The value of the option
 * @property label - The display label for the option
 */
interface OptionType {
  value?: string;
  label: string;
}

/**
 * OptionProps defines the props for the Option component.
 * @property option - The option data to render
 * @property className - Additional CSS classes
 */
interface OptionProps {
  option: string;
  className?: string;
}

/**
 * Option component renders a single <option> element for a dropdown/select.
 * @param option - The option data to render
 * @param className - Additional CSS classes
 */
const Option = ({ option, className }: OptionProps) => (
  <option 
    key={option} 
    value={option} 
    className={cn("text-white bg-gray-800/20", className)}
  >
    {option}
  </option>
);

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Option;
export type { OptionType }; 