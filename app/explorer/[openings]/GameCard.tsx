import { TopGame } from "@/app/types";
import { memo, useMemo } from "react";
import React from "react";

// Memoized GameCard component for better performance
const GameCard = memo(({ game }: { game: TopGame }) => {
  const resultColor = useMemo(() => {
    switch (game.result) {
      case "white":
        return "bg-white";
      case "black":
        return "bg-black";
      default:
        return "bg-slate-400";
    }
  }, [game.result]);

  const resultText = useMemo(() => {
    switch (game.result) {
      case "white":
        return "1-0";
      case "black":
        return "0-1";
      default:
        return "½-½";
    }
  }, [game.result]);

  const resultDescription = useMemo(() => {
    switch (game.result) {
      case "white":
        return "White won";
      case "black":
        return "Black won";
      default:
        return "Game drawn";
    }
  }, [game.result]);

  return (
    <a
      href={game.gameURL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-200 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/70 group block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-xl"
      aria-label={`View game: ${game.white} vs ${game.black}, ${resultDescription}, ${game.numMoves} moves`}
    >
      <div className="space-y-4">
        {/* Players */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center">
          <div className="flex items-center gap-2 min-w-0 max-w-full">
            <span
              className="text-white font-semibold truncate max-w-[120px] sm:max-w-none"
              title={game.white}
            >
              {game.white}
            </span>
          </div>
          <div className="text-slate-400 text-sm flex-shrink-0 font-medium">
            vs
          </div>
          <div className="flex items-center gap-2 min-w-0 max-w-full">
            <span
              className="text-white font-semibold truncate max-w-[120px] sm:max-w-none"
              title={game.black}
            >
              {game.black}
            </span>
          </div>
        </div>

        {/* Game Result */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-600/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full flex-shrink-0 ${resultColor} border border-slate-200/20`}
              aria-label={resultDescription}
            />
            <span className="text-sm font-medium text-slate-200">
              {resultText}
            </span>
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0 font-medium">
            {game.numMoves} moves
          </span>
        </div>

        {/* Event */}
        {game.event && (
          <div
            className="flex flex-row w-full justify-between items-center text-xs text-slate-400 truncate pt-2 border-t border-slate-600/20"
            title={game.event}
          >
            <span className="truncate flex-1 mr-2">{game.event}</span>
            {/* External link indicator */}
            <div className="flex justify-end flex-shrink-0">
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </a>
  );
});

GameCard.displayName = "GameCard";

export default GameCard;
