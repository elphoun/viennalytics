// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import React from 'react';

import { cn } from "../utils";

// ─ Helper Functions ─────────────────────────────────────────────────────────────────────────────

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Button component renders a styled button with optional click handler and disabled state.
 * @param children - The content to display inside the button
 * @param onClick - Optional click handler
 * @param className - Additional CSS classes
 * @param disabled - Whether the button is disabled
 */
const Button = ({ children, onClick, className, disabled = false }: ButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn("px-4 py-2 bg-white/25 text-white rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200", className)}
    >
      {children}
    </button>
  );
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Button; 