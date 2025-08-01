// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import React from "react";

// ─ Interfaces ───────────────────────────────────────────────────────────────────────────────────
interface SearchIconProps {
  className?: string;
}

/**
 * Custom Search SVG icon component
 * Replaces CiSearch from react-icons for better performance
 */
const SearchIcon: React.FC<SearchIconProps> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default SearchIcon;
