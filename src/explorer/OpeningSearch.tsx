// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { ChangeEvent, KeyboardEvent, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";

import { cn } from "../components/utils";
import { useOpenings } from "../context/UseContext";

// ─ Interfaces ──────────────────────────────────────────────────────────────────────────────────────
interface OpeningSearchProps {
  placeholder?: string;
  value: string;
  onAction: (value: string) => void;
  type?: string;
  className?: string;
  disabled?: boolean;
}

/** OpeningSearch searches the database for an opening */
const OpeningSearch = ({
  placeholder = "Enter text...",
  value,
  onAction,
  type = "text",
  className = "",
  disabled = false
}: OpeningSearchProps) => {
  const { openings } = useOpenings();
  const [temp, setTemp] = useState<string>(value);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  // List of Options to Display
  const options = useMemo(() => openings.map(opening => opening.opening), [openings]);

  // Handle Filter Change
  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const newValue = ev.target.value;
    setTemp(newValue);

    const filtered = newValue.trim() === ''
      ? options
      : options.filter(option =>
        option.toLowerCase().includes(newValue.toLowerCase())
      );
    setFilteredOptions(filtered);
    setShowDropdown(true);
  };

  // Handle Selecting Dropdown Option
  const handleOptionClick = (option: string) => {
    setTemp(option);
    setShowDropdown(false);
    onAction(option);
  };

  // Handle Dropdown Display when Selected
  const handleFocus = () => {
    setFilteredOptions(options);
    setShowDropdown(true);
  };

  // Handle Closing Dropdown when Unfocused
  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 300);
  };

  // Handle when Key is pressed on item
  const handleKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Enter') {
      onAction(temp);
      setShowDropdown(false);
    } else if (ev.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const searchAriaLabel = useMemo(() => `Search ${placeholder}`, [placeholder]);

  return (
    <div className="relative">
      <input
        type={type}
        value={temp}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex-1 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full focus:border-transparent transition-colors duration-200 bg-white/10 text-white placeholder-gray-400",
          className
        )}
        aria-label={placeholder}
      />
      {showDropdown && (
        <div className="absolute top-full left-0 w-full border border-gray-200 bg-white/90 backdrop-blur-sm rounded-md shadow-lg max-h-48 overflow-y-auto z-10 mt-1">
          {filteredOptions.map((option) => (
            <div
              key={option}
              className="px-3 py-2 hover:bg-blue-100 text-gray-800 font-semibold cursor-pointer text-sm"
              onClick={() => handleOptionClick(option)}
              tabIndex={0}
              role="option"
              aria-selected={temp === option}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  onAction(option);
                }
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => onAction(temp)}
        className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:text-white transition-colors duration-200"
        aria-label={searchAriaLabel}
      >
        <CiSearch className="w-5 h-5" />
      </button>
    </div>
  );
};

export default OpeningSearch; 
