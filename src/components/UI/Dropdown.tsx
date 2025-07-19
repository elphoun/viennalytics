import { useState } from 'react';

import { cn } from "../utils";
import Option, { OptionType } from "./Option";

interface DropdownProps {
  options?: OptionType[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

const Dropdown = ({ options, placeholder = "No Variation", className, disabled = false, onSelect }: DropdownProps) => {
  const [search, setSearch] = useState("")
  const renderOptions = options && options.length > 0 ? (
    <>
      {options.map((option) => (
        <Option key={option.value} option={option} />
      ))}
    </>
  ) : (
    <Option option={{ label: placeholder }} className="text-gray-400" />
  );

  return (
    <select
      value={search}
      onChange={(event) => {
        setSearch(event.target.value);
        if (onSelect) {
          onSelect(event.target.value);
        }
      }}
      disabled={disabled}
      aria-label={placeholder}
      className={cn("flex-1 relative p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full focus:border-transparent truncate transition-colors duration-200 bg-transparent z-100", className)}
    >
      {renderOptions}
    </select>
  );
};

export default Dropdown; 