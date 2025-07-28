// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { useMemo, useCallback } from "react";
import BlackKing from "../components/icons/BlackKing";
import Draw from "../components/icons/Draw";
import WhiteKing from "../components/icons/WhiteKing";
import InfoDisplayGrid from "../components/ui/InfoDisplayGrid";

import { Variation } from "../types";
import EloDistributionByOpening from "../components/chart/EloDistributionByOpening";


// ─ Constants ────────────────────────────────────────────────────────────────────────────────────
const GridInfo = {
  winLossDraw: {
    title: "Win/Loss/Draw",
    smallTitle: "W/L/D",
    help: "Shows the win, loss, and draw statistics for this opening"
  },
  openingEval: {
    title: "Opening Eval",
    help: "Displays the evaluation of the opening position"
  },
  averageMoves: {
    title: "Average Number of Moves",
    smallTitle: "Avg # Moves",
    help: "Shows the average number of moves played in this opening"
  },
  eloTrend: {
    title: "Elo Trend Graph",
    help: "Displays the Elo rating trend over time for this opening"
  },
  strongestPlayer: {
    title: "Strongest Soldier",
    help: "Shows the strongest player who has played this opening"
  },
  bestMoveAfter: {
    title: "Best Move After Opening",
    help: "Displays the best move continuation after the opening"
  }
};

const CONTENT = {
  separator: "/",
  notAvailable: "N/A",
  eloTrendNotAvailable: "Elo trend data\nnot available",
  bestMoveNotAvailable: "Best move analysis\nnot available",
  percentage: "%",
  noVariation: "No variation selected.",
  movesSection: "Moves",
  noMoves: "No moves available.",
  moveLabel: (idx: number, move: string) => `${idx + 1}. ${move}`,
};

// ─ Interfaces ───────────────────────────────────────────────────────────────────────────────────

const safeFixed = (num: number | undefined | null, digits = 1) =>
  typeof num === 'number' && !isNaN(num) ? num.toFixed(digits) : '0.0';

/**
 * Props for InfoDisplay component.
 * @property variation - The processed variation to display statistics for
 */
interface InfoDisplayProps {
  variation?: Variation;
}

/**
 * InfoDisplay component displays chess opening statistics and visualizations for a single variation.
 * @param variation - The processed variation to display statistics for
 */
const InfoDisplay = ({ variation }: InfoDisplayProps) => {
  // Memoize all computed values to prevent unnecessary recalculations
  const computedData = useMemo(() => {
    if (!variation) return null;

    // Convert player data to mock games format for the chart (only if needed)
    const mockGames = variation.playerElos.length > 0 ? variation.playerElos.map((player, index) => ({
      opening: variation.variation,
      white: { elo: player.elo, name: player.name },
      black: { elo: player.elo, name: `Player${index}` },
      result: 'white' as const,
      numMoves: variation.averageMoves,
      openingEval: variation.openingEval
    })) : [];

    // Pre-compute win/loss/draw stats
    const statsData = [
      {
        value: safeFixed(variation.winPercentageWhite),
        color: "text-gray-300",
        bgColor: "bg-gray-700/50",
        label: "White",
        icon: <BlackKing />
      },
      {
        value: safeFixed(variation.winPercentageBlack),
        color: "text-white",
        bgColor: "bg-gray-800/50",
        label: "Black",
        icon: <WhiteKing />
      },
      {
        value: safeFixed(variation.drawPercentage),
        color: "text-orange-300",
        bgColor: "bg-orange-900/30",
        label: "Draw",
        icon: <Draw />
      }
    ];

    return {
      mockGames,
      statsData,
      strongestPlayerName: variation.strongestPlayer,
      totalGames: variation.totalGames,
      averageMoves: variation.averageMoves,
      hasPlayerElos: variation.playerElos.length > 0,
      popularNextMoves: variation.popularNextMoves.slice(0, 5) // Limit to 5 for performance
    };
  }, [variation]);

  // Optimized chart rendering - only render when data is available and memoize for performance
  const eloTrendCharts = useMemo(() => {
    if (!computedData?.hasPlayerElos) {
      return (
        <div className="text-gray-300 italic text-center whitespace-pre-line bg-black/20 rounded p-3 border border-gray-600/30 h-full flex items-center justify-center">
          {CONTENT.eloTrendNotAvailable}
        </div>
      );
    }

    // Pre-process data for optimal chart performance
    const optimizedGames = computedData.mockGames.map(game => ({
      opening: game.opening,
      white: { elo: game.white.elo, name: game.white.name },
      black: { elo: game.black.elo, name: game.black.name },
      result: game.result,
      numMoves: game.numMoves,
      openingEval: game.openingEval
    }));

    return (
      <EloDistributionByOpening
        games={optimizedGames}
        height={190}
      />
    );
  }, [computedData]);

  // Always call all hooks - memoize best moves content
  const bestMovesContent = useMemo(() => {
    if (!computedData || computedData.popularNextMoves.length === 0) {
      return (
        <div className="text-gray-300 italic text-center bg-black/20 rounded p-2 border border-gray-600/30">
          {CONTENT.bestMoveNotAvailable}
        </div>
      );
    }

    const getEvalClassName = (evalValue: number | null) => {
      if (evalValue === null) return 'text-gray-300 bg-gray-700/30';
      if (evalValue > 0) return 'text-green-300 bg-green-900/30';
      if (evalValue < 0) return 'text-red-300 bg-red-900/30';
      return 'text-gray-300 bg-gray-700/30';
    };

    return (
      <div className="w-full h-full flex flex-col gap-2 p-2 overflow-y-auto overflow-x-hidden scrollbar-thin max-w-full">
        {computedData.popularNextMoves.map((nextMove) => {
          const evalPrefix = nextMove.eval && nextMove.eval > 0 ? '+' : '';
          const gamesText = `(${nextMove.count} games)`;

          return (
            <div
              key={`${nextMove.move}-${nextMove.count}`}
              className="flex items-center justify-between bg-black/30 rounded-md p-2 border border-gray-600/20 hover:bg-black/40 transition-colors min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-amber-300 font-mono text-sm font-bold flex-shrink-0">
                  {nextMove.move}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {gamesText}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs font-mono px-2 py-1 rounded ${getEvalClassName(nextMove.eval)}`}
                >
                  {evalPrefix}{nextMove.eval?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [computedData]);

  // Early return after all hooks have been called
  if (!variation || !computedData) {
    return (
      <div className="p-6 text-gray-300 text-center flex items-center justify-center h-full w-full">
        <div className="bg-black/20 rounded-lg p-2 border border-gray-600/30">
          {CONTENT.noVariation}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 flex flex-col lg:flex-row h-full w-full gap-2 bg-gradient-to-br from-black/10 to-black/30 max-w-full overflow-y-auto lg:overflow-hidden">
      {/* Main stats grids */}
      <div className="flex flex-col h-auto lg:h-full w-full justify-start lg:justify-between min-h-0 min-w-0 flex-1 flex-shrink-0">
        <InfoDisplayGrid
          title={GridInfo.winLossDraw.title}
          smallTitle={GridInfo.winLossDraw.smallTitle}
          help={GridInfo.winLossDraw.help}
          className="hover:ring-amber-400/70 transition-all duration-200"
        >
          <div className="flex flex-col items-center justify-center h-full w-full text-lg font-semibold gap-2">
            {computedData.statsData.map((item) => (
              <div key={item.label} className={`${item.color} ${item.bgColor} flex items-center gap-3 px-3 py-1.5 flex-1 rounded-md border border-white/10 w-full justify-center transition-colors hover:bg-opacity-70`}>
                <span className="w-6 h-6 flex-shrink-0">{item.icon}</span>
                <span className="font-mono text-base">{item.value}{CONTENT.percentage}</span>
                <span className="text-sm opacity-80">{item.label}</span>
              </div>
            ))}
          </div>
        </InfoDisplayGrid>

        <InfoDisplayGrid
          title="Total Games"
          help="Total number of games played with this opening/variation"
          className=" hover:ring-amber-400/70 bg-amber-900/30 transition-all duration-200"
        >
          <span className="font-bold text-2xl text-amber-300 font-mono">
            {computedData.totalGames.toLocaleString()}
          </span>
        </InfoDisplayGrid>

        <InfoDisplayGrid
          title={GridInfo.averageMoves.title}
          smallTitle={GridInfo.averageMoves.smallTitle}
          help={GridInfo.averageMoves.help}
          className=" hover:ring-amber-400/70 bg-blue-900/30 transition-all duration-200"
        >
          <span className="font-bold text-2xl text-blue-300 font-mono">
            {computedData.averageMoves.toFixed(1)}
          </span>
        </InfoDisplayGrid>

        <InfoDisplayGrid
          title={GridInfo.strongestPlayer.title}
          help={GridInfo.strongestPlayer.help}
          className=" hover:ring-amber-400/70 bg-purple-900/30 transition-all duration-200"
        >
          <span className="font-bold text-lg text-purple-300 leading-tight break-words text-nowrap">
            {computedData.strongestPlayerName}
          </span>
        </InfoDisplayGrid>
      </div >

      <div className="flex flex-col h-auto lg:h-full w-full items-center gap-2 justify-start lg:justify-between lg:flex-[2] min-h-0 min-w-0 overflow-hidden">
        <InfoDisplayGrid
          title={GridInfo.eloTrend.title}
          help={GridInfo.eloTrend.help}
          className="p-0 hover:ring-amber-400/70 transition-all duration-200 flex-shrink-0"
        >
          {eloTrendCharts}
        </InfoDisplayGrid>

        <InfoDisplayGrid
          title={GridInfo.bestMoveAfter.title}
          help={GridInfo.bestMoveAfter.help}
          className="hover:ring-amber-400/70 transition-all duration-200 flex-1 min-h-0 max-h-50 lg:h-full"
        >
          <div className="h-full w-full overflow-hidden max-w-full">
            {bestMovesContent}
          </div>
        </InfoDisplayGrid>
      </div>
    </div >
  );
}

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default InfoDisplay;
