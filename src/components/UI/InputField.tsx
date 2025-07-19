import React, { FC, useState, useEffect } from 'react';
import { CiSearch } from "react-icons/ci";

import { cn } from "../utils";

interface InputFieldProps {
  placeholder?: string;
  value: string;
  onAction: (value: string) => void;
  type?: string;
  className?: string;
  disabled?: boolean;
  datalistOptions?: string[];
}

const InputField: FC<InputFieldProps> = ({
  placeholder = "Enter text...",
  value,
  onAction,
  type = "text",
  className = "",
  disabled = false,
  datalistOptions
}) => {
  const [temp, setTemp] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  useEffect(() => {
    setTemp(value);
  }, [value]);

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = ev.target.value;
    setTemp(newValue);
    
    if (datalistOptions) {
      const filtered = datalistOptions.filter(option =>
        option.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      setShowDropdown(newValue.length > 0 && filtered.length > 0);
    }
  };

  const handleOptionClick = (option: string) => {
    setTemp(option);
    setShowDropdown(false);
    onAction(option);
  };

  const handleFocus = () => {
    if (datalistOptions && temp.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  const searchAriaLabel = `Search ${placeholder}`;

  return (
    <div className="relative">
      <input
        type={type}
        value={temp}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full focus:border-transparent transition-colors duration-200 bg-white/10 text-white placeholder-gray-400",
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

export default InputField; 