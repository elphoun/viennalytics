import { BlackKing, Draw, InfoCircle, WhiteKing } from "@/app/_components";
import { Variant } from "@/app/types";
import { useMemo } from "react";
import { cn } from "../../utils";
import EloBarChart from "@/app/_components/graphs/EloBarChart";

const GRID_INFO = {
  winLossDraw: {
    title: "Win/Loss/Draw",
    smallTitle: "W/L/D",
    help: "Shows the win, loss, and draw statistics for this opening",
  },
  openingEval: {
    title: "Opening Eval",
    help: "Displays the evaluation of the opening position",
  },
  averageMoves: {
    title: "Average Number of Moves",
    smallTitle: "Avg # Moves",
    help: "Shows the average number of moves played in this opening",
  },
  eloTrend: {
    title: "Elo Trend Graph",
    help: "Displays the Elo rating trend over time for this opening",
  },
  strongestPlayer: {
    title: "Strongest Soldier",
    help: "Shows the strongest player who has played this opening",
  },
  bestMoveAfter: {
    title: "Best Move After Opening",
    help: "Displays the best move continuation after the opening",
  },
};

const CONTENT = {
  eloTrendNotAvailable: "Elo trend data\nnot available",
  bestMoveNotAvailable: "Best move analysis\nnot available",
  noVariation: "No variation selected.",
  noMoves: "No moves available.",
};

const formatNum = (num: number | undefined | null, digits = 1) =>
  typeof num === "number" && !isNaN(num) ? num.toFixed(digits) : "0.0";

interface InfoDisplayGridProps {
  title: string;
  smallTitle?: string;
  help: string;
  className?: string;
  children: React.ReactNode;
}
const InfoDisplayGrid = ({
  title,
  smallTitle,
  help,
  className,
  children,
}: InfoDisplayGridProps) => (
  <div
    className={cn(
      "relative group bg-white/10 backdrop-blur-sm border-2 border-amber-400/50 w-full flex flex-col items-center gap-1 justify-center h-full rounded-lg p-1",
      className,
    )}
  >
    <div className="w-full bg-black/40 flex items-center justify-center p-1 rounded relative min-h-[28px]">
      <span className="text-xs sm:text-sm text-center w-full font-semibold pr-5 truncate leading-tight text-neutral-100">
        <span className="hidden md:inline">{title}</span>
        <span className="md:hidden">{smallTitle || title}</span>
      </span>
      <InfoCircle title={help} />
    </div>
    <div className="w-full h-full flex items-center justify-center text-center min-h-0 overflow-y-auto">
      {children}
    </div>
  </div>
);

const InfoDisplay = ({
  variation,
}: {
  variation: Variant | null | undefined;
}) => {
  const computedData = useMemo(() => {
    if (!variation) return null;

    // Safely handle all data fields to prevent object rendering errors
    const safeWinPercentageWhite =
      typeof variation.winPercentageWhite === "number"
        ? variation.winPercentageWhite
        : 0;
    const safeWinPercentageBlack =
      typeof variation.winPercentageBlack === "number"
        ? variation.winPercentageBlack
        : 0;
    const safeDrawPercentage =
      typeof variation.drawPercentage === "number"
        ? variation.drawPercentage
        : 0;
    const safeTotalGames =
      typeof variation.totalGames === "number" ? variation.totalGames : 0;
    const safeAverageMoves =
      typeof variation.averageMoves === "number" ? variation.averageMoves : 0;

    // Safely handle strongestPlayer
    const safeStrongestPlayer =
      typeof variation.strongestPlayer === "string"
        ? variation.strongestPlayer
        : variation.strongestPlayer &&
            typeof variation.strongestPlayer === "object" &&
            "name" in variation.strongestPlayer
          ? String(variation.strongestPlayer || "Unknown Player")
          : "Unknown Player";

    // Safely handle popularNextMoves
    const safePopularNextMoves = Array.isArray(variation.popularNextMoves)
      ? variation.popularNextMoves.filter(
          (move) =>
            move &&
            typeof move === "object" &&
            typeof move.move === "string" &&
            typeof move.fen === "string" &&
            (typeof move.eval === "number" || move.eval === null),
        )
      : [];

    const statsData = [
      {
        value: formatNum(safeWinPercentageWhite),
        color: "text-gray-300",
        bgColor: "bg-gray-700/50",
        label: "White",
        icon: <WhiteKing />,
      },
      {
        value: formatNum(safeWinPercentageBlack),
        color: "text-white",
        bgColor: "bg-gray-800/50",
        label: "Black",
        icon: <BlackKing />,
      },
      {
        value: formatNum(safeDrawPercentage),
        color: "text-orange-300",
        bgColor: "bg-orange-900/30",
        label: "Draw",
        icon: <Draw />,
      },
    ];

    const leftGrids = [
      {
        id: "winLossDraw",
        title: GRID_INFO.winLossDraw.title,
        smallTitle: GRID_INFO.winLossDraw.smallTitle,
        help: GRID_INFO.winLossDraw.help,
        className:
          "hover:ring-amber-400/70 transition-all duration-200 min-h-0 flex flex-col flex-[2]",
        content: (
          <div className="flex flex-col items-center justify-center p-1 h-full w-full text-lg font-semibold gap-2 min-h-0">
            {statsData.map((item) => (
              <div
                key={item.label}
                className={`${item.color} ${item.bgColor} flex items-center gap-3 px-3.5 rounded-md border flex-1 border-white/10 w-full h-fit justify-center transition-colors hover:bg-opacity-70`}
              >
                <span className="w-6 h-6 flex-shrink-0">{item.icon}</span>
                <span className="font-mono text-base">{item.value}%</span>
                <span className="text-sm opacity-80">{item.label}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "totalGames",
        title: "Total Games",
        help: "Total number of games played with this opening/variation",
        className:
          "hover:ring-amber-400/70 bg-amber-900/30 transition-all duration-200 min-h-0 flex flex-col flex-1",
        content: (
          <span className="font-bold text-2xl text-amber-300 font-mono flex items-center justify-center">
            {safeTotalGames.toLocaleString()}
          </span>
        ),
      },
      {
        id: "averageMoves",
        title: GRID_INFO.averageMoves.title,
        smallTitle: GRID_INFO.averageMoves.smallTitle,
        help: GRID_INFO.averageMoves.help,
        className:
          "hover:ring-amber-400/70 bg-blue-900/30 duration-200 min-h-0 flex flex-col flex-1",
        content: (
          <span className="font-bold text-2xl text-blue-300 font-mono flex items-center justify-center">
            {safeAverageMoves.toFixed(1)}
          </span>
        ),
      },
      {
        id: "strongestPlayer",
        title: GRID_INFO.strongestPlayer.title,
        help: GRID_INFO.strongestPlayer.help,
        className:
          "hover:ring-amber-400/70 bg-purple-900/30 transition-all duration-200 min-h-0 flex flex-col flex-1",
        content: (
          <span className="font-bold text-lg text-purple-300 leading-tight break-words flex items-center justify-center">
            {safeStrongestPlayer}
          </span>
        ),
      },
    ];

    return {
      statsData,
      leftGrids,
      strongestPlayerName: safeStrongestPlayer,
      totalGames: safeTotalGames,
      averageMoves: safeAverageMoves,
      hasPlayerElos:
        Array.isArray(variation.playerElos) && variation.playerElos.length > 0,
      popularNextMoves: safePopularNextMoves,
    };
  }, [variation]);

  const getEvalClassName = (evalValue: number | null) => {
    if (evalValue === null) return "text-gray-300 bg-gray-700/30";
    if (evalValue > 0) return "text-green-300 bg-green-900/30";
    if (evalValue < 0) return "text-red-300 bg-red-900/30";
    return "text-gray-300 bg-gray-700/30";
  };

  const rightGrids = useMemo(() => {
    // Safely handle playerElos data with strict type checking
    const safePlayerElos = Array.isArray(variation?.playerElos)
      ? variation?.playerElos
          .filter(
            (player) =>
              player &&
              typeof player === "object" &&
              "name" in player &&
              "elo" in player &&
              typeof player.name === "string" &&
              typeof player.elo === "number" &&
              !isNaN(player.elo),
          )
          .map((player) => ({
            name: String(player.name),
            elo: Number(player.elo),
          }))
      : [];

    const eloTrendContent = !safePlayerElos?.length ? (
      <div className="text-gray-300 italic text-center whitespace-pre-line bg-black/20 rounded border border-gray-600/30 h-full flex items-center justify-center">
        {CONTENT.eloTrendNotAvailable}
      </div>
    ) : (
      <EloBarChart eloData={safePlayerElos || []} />
    );

    // Additional safety check for popularNextMoves
    const safePopularNextMoves = computedData?.popularNextMoves || [];
    const bestMovesContent = !safePopularNextMoves.length ? (
      <div className="text-gray-300 italic text-center whitespace-pre-line bg-black/20 rounded p-3 border border-gray-600/30 h-full flex items-center justify-center">
        {CONTENT.bestMoveNotAvailable}
      </div>
    ) : (
      <div className="h-full w-full overflow-y-auto space-y-2 p-2 scrollbar-thin">
        <div className="space-y-2 max-h-30">
          {safePopularNextMoves.map((move, index) => {
            // Additional safety check for each move
            if (!move || typeof move !== "object") return null;

            const safeMove = String(move.move || "Unknown");
            const safeEval = typeof move.eval === "number" ? move.eval : null;

            return (
              <div
                key={`${safeMove}-${index}`}
                className="flex items-center justify-between p-2 bg-black/30 rounded border border-gray-600/30 hover:bg-black/40 transition-colors"
              >
                <span className="font-mono text-sm text-white">{safeMove}</span>
                <div
                  className={`px-2 rounded text-xs font-medium ${getEvalClassName(safeEval)}`}
                >
                  {`${safeEval && safeEval > 0 ? "+" : ""}${formatNum(safeEval, 2)}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    return [
      {
        id: "eloTrend",
        title: GRID_INFO.eloTrend.title,
        help: GRID_INFO.eloTrend.help,
        className:
          "hover:ring-amber-400/70 transition-all duration-200 w-full flex-1",
        content: (
          <div className="w-full h-full min-h-[350px]">{eloTrendContent}</div>
        ),
      },
      {
        id: "bestMoves",
        title: GRID_INFO.bestMoveAfter.title,
        help: GRID_INFO.bestMoveAfter.help,
        className:
          "hover:ring-amber-400/70 transition-all duration-200 w-full flex-1 max-h-50",
        content: (
          <div className="h-full w-full overflow-y-auto">
            {bestMovesContent}
          </div>
        ),
      },
    ];
  }, [computedData?.popularNextMoves, variation?.playerElos]);

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
    <div className="flex flex-col xl:flex-row h-full w-full gap-2 bg-gradient-to-br from-black/10 to-black/30 max-w-full overflow-y-auto xl:overflow-hidden">
      <div className="flex flex-col h-auto xl:h-full w-full justify-start xl:justify-around min-h-0 min-w-0 flex-1 flex-shrink-0 gap-2 xl:flex-1">
        {computedData.leftGrids.map((grid) => (
          <InfoDisplayGrid
            key={grid.id}
            title={grid.title}
            smallTitle={grid.smallTitle}
            help={grid.help}
            className={grid.className}
          >
            {grid.content}
          </InfoDisplayGrid>
        ))}
      </div>

      <div className="flex flex-col h-auto xl:h-full w-full gap-2 xl:flex-[2.5] min-h-0">
        {rightGrids.map((grid) => (
          <InfoDisplayGrid
            key={grid.id}
            title={grid.title}
            help={grid.help}
            className={grid.className}
          >
            {grid.content}
          </InfoDisplayGrid>
        ))}
      </div>
    </div>
  );
};

export default InfoDisplay;
