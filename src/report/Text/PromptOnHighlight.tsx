import { FC, ReactNode } from "react";

interface PromptOnHighlightProps {
  children: ReactNode;
  prompt: ReactNode;
  className?: string;
}

const PromptOnHighlight: FC<PromptOnHighlightProps> = ({
  children,
  prompt,
  className = "",
}) => (
  <>
    {" "}
    <span
      className={`indent-0 relative inline-block mr-1 cursor-pointer transition-transform hover:animate-wiggle text-green-300 font-semibold group ${className}`}
    >
      {children}
      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max px-1 py-1 text-xs rounded bg-green-300 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg indent-0">
        {prompt}
      </span>
    </span>
  </>
);

export default PromptOnHighlight;
