// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo, ReactNode } from "react";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface HyperlinkProps {
  children: ReactNode;
  link: string;
}

/**
 * Hyperlink component renders a styled external link with proper spacing.
 * @param children - The content to display as the link text
 * @param link - The URL to link to
 */
const Hyperlink = memo(({ children, link }: HyperlinkProps) => (
  <>
    {' '}
    <a 
      href={link} 
      target="_blank" 
      className="underline align-middle text-orange-400 inline-flex items-center justify-center" 
      rel="noreferrer"
    >
      {children}
    </a>
    {' '}
  </>
));
Hyperlink.displayName = "Hyperlink";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Hyperlink;