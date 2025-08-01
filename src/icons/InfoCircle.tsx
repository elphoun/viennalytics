// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import React from "react";

// ─ Interfaces ───────────────────────────────────────────────────────────────────────────────────
interface InfoCircleProps {
  className?: string;
  title?: string;
}

/**
 * Custom InfoCircle SVG icon component
 * Replaces FaInfoCircle from react-icons for better performance
 */
const InfoCircle: React.FC<InfoCircleProps> = ({ className, title }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      {title && <title>{title}</title>}
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M12 16v-4m0-4h.01"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default InfoCircle;
