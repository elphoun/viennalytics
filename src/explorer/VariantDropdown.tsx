// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import Option from "../components/ui/Option";
import { cn } from "../components/utils";

// ─ Interfaces ──────────────────────────────────────────────────────────────────────────────────────
interface VariantDropdownProps {
  options?: string[];
  value?: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

// ─ Constants ──────────────────────────────────────────────────────────────────────────────────────
const PLACEHOLDER = "No Variations";

/** VariantDropdown renders and allows the user to select a variant from the dropdown */
const VariantDropdown = ({ options, value, disabled = false, onSelect }: VariantDropdownProps) => {
  const renderOptions = options && options.length > 0 ? (
    <>
      {options.map((option) => (
        <Option key={option} option={option} />
      ))}
    </>
  ) : (
    <Option option={PLACEHOLDER} className="text-gray-400" />
  );

  return (
    <select
      value={value}
      onChange={(ev) => {
        if (onSelect) {
          onSelect(ev.target.value);
        }
      }}
      disabled={disabled}
      aria-label={PLACEHOLDER}
      className={cn("flex-1 relative p-2 border border-gray-300 rounded-md focus:outline-none",
        "focus:ring-2 focus:ring-blue-500 w-full focus:border-transparent truncate",
        "transition-colors duration-200 bg-transparent z-100")}
    >
      {renderOptions}
    </select>
  );
};

export default VariantDropdown; 