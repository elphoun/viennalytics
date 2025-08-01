// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from 'react';

import { cn } from "../../utils";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface CodeBlockProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * CodeBlock component displays formatted code with optional title and description.
 * @param title - Optional title to display above the code
 * @param description - Optional description to display above the code
 * @param children - The code content to display
 * @param className - Additional CSS classes to apply
 */
const CodeBlock = memo(({ 
  title, 
  description, 
  children, 
  className = "" 
}: CodeBlockProps) => (
  <div className={cn("bg-gray-900/80 border border-gray-600/50 rounded-lg p-4 font-mono text-sm overflow-x-auto code-scrollbar", className)}>
    {description && (
      <div className="text-gray-300 mb-3 font-medium">
        {description}
      </div>
    )}
    {title && (
      <div className="text-orange-300 mb-2 font-semibold">{title}</div>
    )}
    <pre className="text-white/90 overflow-x-auto">
      {children}
    </pre>
  </div>
));
CodeBlock.displayName = "CodeBlock";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default CodeBlock;