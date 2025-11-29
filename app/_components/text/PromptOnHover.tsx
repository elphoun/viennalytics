import { cloneElement, isValidElement, memo, ReactNode } from "react";

import { cn } from "../../utils";

interface PromptOnHoverProps {
  children: ReactNode;
  prompt: ReactNode;
  className?: string;
}

const PromptOnHover = memo(
  ({ children, prompt, className = "" }: PromptOnHoverProps) => (
    <>
      {" "}
      <span
        className={cn(
          "indent-0 relative cursor-pointer transition-transform inline-flex items-center align-middle",
          "hover:animate-wiggle text-orange-300 font-semibold group",
          className,
        )}
      >
        {children}
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 top-full mt-1 p-2 w-max text-xs font-semibold rounded",
            "bg-orange-400 text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity",
            "pointer-events-none z-10 shadow-lg indent-0",
          )}
        >
          {isValidElement(prompt) &&
          typeof prompt.type !== 'string' &&
          prompt.type &&
          'displayName' in prompt.type &&
          prompt.type.displayName === "Quote"
            ? cloneElement(prompt as any, { inline: true })
            : prompt}
        </span>
      </span>{" "}
    </>
  ),
);

PromptOnHover.displayName = "PromptOnHover";

export default PromptOnHover;
