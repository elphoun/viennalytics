import { memo, useMemo } from "react";

import { GameDisplay } from "../types";

// Memoized GameCard component for better performance
const GameCard = memo(({ game }: { game: GameDisplay }) => {
  const resultColor = useMemo(() => {
    switch (game.result) {
      case 'white': return 'bg-white';
      case 'black': return 'bg-black';
      default: return 'bg-gray-400';
    }
  }, [game.result]);

  const resultText = useMemo(() => {
    switch (game.result) {
      case 'white': return '1-0';
      case 'black': return '0-1';
      default: return '½-½';
    }
  }, [game.result]);

  return (
    <a
      href={game.gameURL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 bg-white/5 hover:bg-white/10 transition-colors duration-200 rounded-lg p-3 border border-white/10 hover:border-white/20 group block"
    >
      <div className="space-y-3">
        {/* Players */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-white font-medium truncate">{game.white.name}</span>
            <span className="text-gray-300 text-sm flex-shrink-0">({game.white.elo})</span>
          </div>
          <div className="text-gray-400 text-xs flex-shrink-0">vs</div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-white font-medium truncate">{game.black.name}</span>
            <span className="text-gray-300 text-sm flex-shrink-0">({game.black.elo})</span>
          </div>
        </div>

        {/* Game Result */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${resultColor}`} />
            <span className="text-sm text-gray-300">{resultText}</span>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">{game.numMoves} moves</span>
        </div>

        {/* Event */}
        {game.event && (
          <div className="flex flex-row w-full justify-between text-xs text-gray-400 truncate" title={game.event}>
            {game.event}
            {/* External link indicator */}
            <div className="flex justify-end">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </a>
  );
});

GameCard.displayName = 'GameCard';

export default GameCard;