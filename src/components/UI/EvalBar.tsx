import { memo } from "react";

import { cn } from "../utils";

interface EvalBarProps {
  /**
   * The evaluation score, expected to be a percentage (0-100)
   * representing the white player's advantage.
   * 50 means an equal position.
   * > 50 means white has an advantage.
   * < 50 means black has an advantage.
   */
  evaluation: number;
}

const SET_DEFAULT_EVALUATION = 50;

const EvalBar = memo(({ evaluation }: EvalBarProps) => {
  // If evaluation is undefined, null, or not a number, treat as 50 (equal)
  const safeEval = evaluation ? evaluation : SET_DEFAULT_EVALUATION;
  const whitePercentage = Math.max(0, Math.min(100, safeEval));
  const blackPercentage = 100 - whitePercentage;

  // Convert the evaluation percentage to a typical chess score format.
  // Assuming 50 is an equal position (0.0).
  const score = (whitePercentage - 50) / 10;
  const displayScore = score.toFixed(1);

  // Determine text color based on the background.
  // If the score is in the upper (black) part, text is white. Otherwise, black.
  const isTextOnBlack = (blackPercentage > 15);
  const textColorClass = isTextOnBlack ? "text-white" : "text-black";

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full flex flex-col overflow-hidden rounded-sm bg-neutral-700">
        <div
          className="w-full bg-neutral-900 transition-all duration-300 ease-in-out"
          style={{ height: `${blackPercentage}%` }}
        />
        <div
          className="w-full bg-neutral-100 transition-all duration-300 ease-in-out"
          style={{ height: `${whitePercentage}%` }}
        />
      </div>
      <span
        className={cn(
          "absolute top-1 left-1/2 -translate-x-1/2 font-bold text-xs pointer-events-none",
          textColorClass
        )}
        style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)" }}
      >
        {displayScore}
      </span>
    </div>
  );
});

EvalBar.displayName = "EvalBar";

export default EvalBar;