// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { ReactNode } from "react";

// ─ Helper Functions ─────────────────────────────────────────────────────────────────────────────

/**
 * Universal TextProps for all text components
 * @property text - The text to display
 * @property icon - Optional icon to display
 */
interface TextProps {
  text: string;
  icon?: ReactNode;
}

/**
 * ClickProps describes the props for a button
 * @property icon - Optional icon to display in the button
 * @property label - The text label of the button
 * @property onClick - Function to call when the button is clicked
 * @property disabled - Whether the button is disabled
 * @property type - The button type attribute
 * @property className - Additional CSS classes for the button
 */
interface ClickProps {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export type { ClickProps, TextProps };