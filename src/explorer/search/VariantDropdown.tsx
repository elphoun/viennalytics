// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import Option from "../../ui/Option";
import { cn } from "../../utils";

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

  const uniqueOptions = [...new Set(options)]

  const renderOptions = options && options.length > 0 ? (
    <>
      {uniqueOptions
      .map((option) => (
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
      className={cn("w-full relative p-2 border border-gray-300 rounded-md focus:outline-none",
        "focus:ring-2 focus:ring-blue-500 focus:border-transparent truncate min-w-0",
        "transition-colors duration-200 bg-white/10 text-white z-100")}
    >
      {renderOptions}
    </select>
  );
};

export default VariantDropdown; 