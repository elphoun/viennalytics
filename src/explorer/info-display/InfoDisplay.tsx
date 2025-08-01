// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { useMemo } from "react";

import EloBarChart from "./EloBarChart";
import InfoDisplayGrid from "./InfoDisplayGrid";
import BlackKing from "../../icons/BlackKing";
import Draw from "../../icons/Draw";
import WhiteKing from "../../icons/WhiteKing";

import type { Variation } from "../../types";

// ─ Constants ────────────────────────────────────────────────────────────────────────────────────
const GRID_INFO = {
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

/** formatNum formats a number to a certain round */
const formatNum = (num: number | undefined | null, digits = 1) =>
  typeof num === 'number' && !isNaN(num) ? num.toFixed(digits) : '0.0';


/** InfoDisplay displays the opening statistics */
const InfoDisplay = ({ variation }: { variation?: Variation }) => {
  const computedData = useMemo(() => {
    if (!variation) { return null; }

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
        value: formatNum(variation.winPercentageWhite),
        color: "text-gray-300",
        bgColor: "bg-gray-700/50",
        label: "White",
        icon: <BlackKing />
      },
      {
        value: formatNum(variation.winPercentageBlack),
        color: "text-white",
        bgColor: "bg-gray-800/50",
        label: "Black",
        icon: <WhiteKing />
      },
      {
        value: formatNum(variation.drawPercentage),
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
      popularNextMoves: variation.popularNextMoves
    };
  }, [variation]);

  const eloTrendCharts = useMemo(() => {
    if (!computedData?.hasPlayerElos) {
      return (
        <div className="text-gray-300 italic text-center whitespace-pre-line bg-black/20 rounded border border-gray-600/30 h-full flex items-center justify-center">
          {CONTENT.eloTrendNotAvailable}
        </div>
      );
    }

    const eloData = variation?.playerElos || [];
    return (
      <EloBarChart
        eloData={eloData}
      />
    );
  }, [computedData?.hasPlayerElos, variation?.playerElos])

  const getEvalClassName = useMemo(() => {
    return (evalValue: number | null) => {
      if (evalValue === null) { return 'text-gray-300 bg-gray-700/30' };
      if (evalValue > 0) { return 'text-green-300 bg-green-900/30' };
      if (evalValue < 0) { return 'text-red-300 bg-red-900/30' };
      return 'text-gray-300 bg-gray-700/30';
    };
  }, []);

  const bestMovesContent = useMemo(() => {
    if (!computedData?.popularNextMoves || computedData.popularNextMoves.length === 0) {
      return (
        <div className="text-gray-300 italic text-center whitespace-pre-line bg-black/20 rounded p-3 border border-gray-600/30 h-full flex items-center justify-center">
          {CONTENT.bestMoveNotAvailable}
        </div>
      );
    }

    const movesDisplay = computedData.popularNextMoves.length === 0 ? (
      <div className="text-gray-400 italic text-center py-4">
        {CONTENT.noMoves}
      </div>
    ) : (
      <div className="space-y-2 max-h-30">
        {computedData.popularNextMoves.map((move) => {
          const evalDisplay = `${move.eval > 0 ? '+' : ''}${formatNum(move.eval, 2)}`
          return (
            <div
              key={`${move.move}-${move.fen}`}
              className="flex items-center justify-between p-2 bg-black/30 rounded border border-gray-600/30 hover:bg-black/40 transition-colors"
            >
              <span className="font-mono text-sm text-white">
                {move.move}
              </span>
              <div className="flex items-center gap-2">
                <div className={`px-2 rounded text-xs font-medium ${getEvalClassName(move.eval)}`}>
                  {evalDisplay}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return (
      <div className="h-full w-full overflow-y-auto space-y-2 p-2 scrollbar-thin">
        {movesDisplay}
      </div>
    );
  }, [computedData?.popularNextMoves, variation?.openingEval]);

  // Cover for no variation case
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
      <div className="flex flex-col h-auto lg:h-full w-full justify-start lg:justify-around min-h-0 min-w-0 flex-1 flex-shrink-0 gap-2 lg:flex-1">
        <InfoDisplayGrid
          title={GRID_INFO.winLossDraw.title}
          smallTitle={GRID_INFO.winLossDraw.smallTitle}
          help={GRID_INFO.winLossDraw.help}
          className="hover:ring-amber-400/70 transition-all duration-200 flex-[2] min-h-0 flex flex-col"
        >
          <div className="flex flex-col items-center justify-center h-full w-full text-lg font-semibold gap-2 flex-1 min-h-0">
            {computedData.statsData.map((item) => (
              <div key={item.label} className={`${item.color} ${item.bgColor} flex items-center gap-3 px-3.5 flex-1 rounded-md border border-white/10 w-full justify-center transition-colors hover:bg-opacity-70`}>
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
          className="hover:ring-amber-400/70 bg-amber-900/30 transition-all duration-200 flex-1 min-h-0 flex flex-col"
        >
          <span className="font-bold text-2xl text-amber-300 font-mono flex-1 flex items-center justify-center">
            {computedData.totalGames.toLocaleString()}
          </span>
        </InfoDisplayGrid>

        <InfoDisplayGrid
          title={GRID_INFO.averageMoves.title}
          smallTitle={GRID_INFO.averageMoves.smallTitle}
          help={GRID_INFO.averageMoves.help}
          className="hover:ring-amber-400/70 bg-blue-900/30 transition-all duration-200 flex-1 min-h-0 flex flex-col"
        >
          <span className="font-bold text-2xl text-blue-300 font-mono flex-1 flex items-center justify-center">
            {computedData.averageMoves.toFixed(1)}
          </span>
        </InfoDisplayGrid>

        <InfoDisplayGrid
          title={GRID_INFO.strongestPlayer.title}
          help={GRID_INFO.strongestPlayer.help}
          className="hover:ring-amber-400/70 bg-purple-900/30 transition-all duration-200 flex-1 min-h-0 flex flex-col"
        >
          <span className="font-bold text-lg text-purple-300 leading-tight break-words flex-1 flex items-center justify-center">
            {computedData.strongestPlayerName}
          </span>
        </InfoDisplayGrid>
      </div >

      {/* Charts Section */}
      <div className="flex flex-col h-auto lg:h-full w-full gap-2 lg:flex-[2.5] min-h-0">
        {/* ELO Trend Chart Section */}
        <InfoDisplayGrid
          title={GRID_INFO.eloTrend.title}
          help={GRID_INFO.eloTrend.help}
          className="hover:ring-amber-400/70 transition-all duration-200 w-full flex-1"
        >
          <div className="w-full h-full min-h-[300px] md:min-h-0">
            {eloTrendCharts}
          </div>
        </InfoDisplayGrid>
        {/* Best Moves Section */}
        <InfoDisplayGrid
          title={GRID_INFO.bestMoveAfter.title}
          help={GRID_INFO.bestMoveAfter.help}
          className="hover:ring-amber-400/70 transition-all duration-200 w-full"
        >
          <div className="h-full min-h-[100px] w-full overflow-y-auto">
            {bestMovesContent}
          </div>
        </InfoDisplayGrid>
      </div>
    </div >
  );
}

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default InfoDisplay;