import React, { Fragment } from "react";

import BestMoveChart from "../components/ui/BestMoveChart";
import EloTrendGraph from "../components/ui/EloTrendGraph";
import InfoDisplayGrid from "../components/ui/InfoDisplayGrid";

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

interface GameData {
  result: string;
  movePair: number;
  white: { name: string; elo: number };
  black: { name: string; elo: number };
}

// Sample data for D3.js visualizations
const sampleEloTrendData = [
  { date: "2024-01-01", elo: 1200 },
  { date: "2024-02-01", elo: 1250 },
  { date: "2024-03-01", elo: 1180 },
  { date: "2024-04-01", elo: 1320 },
  { date: "2024-05-01", elo: 1280 },
  { date: "2024-06-01", elo: 1350 },
  { date: "2024-07-01", elo: 1400 },
  { date: "2024-08-01", elo: 1380 },
  { date: "2024-09-01", elo: 1450 },
  { date: "2024-10-01", elo: 1420 },
  { date: "2024-11-01", elo: 1480 },
  { date: "2024-12-01", elo: 1500 }
];

const sampleBestMoveData = [
  { move: "Nf3", evaluation: 0.85, frequency: 0.4 },
  { move: "d4", evaluation: 0.72, frequency: 0.3 },
  { move: "e4", evaluation: 0.68, frequency: 0.2 },
  { move: "c4", evaluation: 0.45, frequency: 0.1 }
];

interface InfoDisplayProps {
  data: GameData[];
}

const CONTENT = {
  separator: "/",
  notAvailable: "N/A",
  eloTrendNotAvailable: "Elo trend data\nnot available",
  bestMoveNotAvailable: "Best move analysis\nnot available",
  percentage: "%"
};

const calculateStats = (data: GameData[]) => {
  const totalGames = data.length;
  const wins = data.filter(game => game.result === "white").length;
  const losses = data.filter(game => game.result === "black").length;
  const draws = data.filter(game => game.result === "draw").length;

  const winPercentage = ((wins / totalGames) * 100).toFixed(1);
  const lossPercentage = ((losses / totalGames) * 100).toFixed(1);
  const drawPercentage = ((draws / totalGames) * 100).toFixed(1);

  const averageMoves = (data.reduce((sum, game) => sum + game.movePair, 0) / totalGames).toFixed(1);

  const allPlayers: { name: string; elo: number }[] = [];
  data.forEach(game => {
    allPlayers.push({ name: game.white.name, elo: game.white.elo });
    allPlayers.push({ name: game.black.name, elo: game.black.elo });
  });
  const strongestPlayer = allPlayers.reduce((max, player) =>
    player.elo > max.elo ? player : max
    , allPlayers[0] || { name: CONTENT.notAvailable, elo: 0 });

  return {
    totalGames,
    wins,
    losses,
    draws,
    winPercentage,
    lossPercentage,
    drawPercentage,
    averageMoves,
    strongestPlayer
  };
};

const InfoDisplay = ({ data }: InfoDisplayProps) => {

  const stats = calculateStats(data);

  return (
    <div className="p-2 grid h-full w-full grid-cols-3 gap-3">
      <InfoDisplayGrid
        title={GridInfo.winLossDraw.title}
        smallTitle={GridInfo.winLossDraw.smallTitle}
        help={GridInfo.winLossDraw.help}
        className="col-span-1 row-start-1 row-end-1 min-h-[80px]"
      >
        <div className="flex flex-row items-center justify-center h-full w-full text-sm sm:text-base flex-wrap gap-1 sm:gap-2">
          {[
            { value: stats.winPercentage, color: "text-green-600", type: "win" },
            { value: stats.lossPercentage, color: "text-red-600", type: "loss" },
            { value: stats.drawPercentage, color: "text-yellow-600", type: "draw" }
          ].map((item, index) => (
            <Fragment key={`stat-${item.type}`}>
              <span className={`font-bold ${item.color}`}>
                {item.value}{CONTENT.percentage}
              </span>
              {index < 2 && <span>{CONTENT.separator}</span>}
            </Fragment>
          ))}
        </div>
      </InfoDisplayGrid>

      <InfoDisplayGrid
        title={GridInfo.openingEval.title}
        help={GridInfo.openingEval.help}
        className="col-span-1 row-start-2 row-end-2"
      >
        <span className="text-lg sm:text-xl font-semibold text-gray-600">
          {CONTENT.notAvailable}
        </span>
      </InfoDisplayGrid>

      <InfoDisplayGrid
        title={GridInfo.averageMoves.title}
        smallTitle={GridInfo.averageMoves.smallTitle}
        help={GridInfo.averageMoves.help}
        className="col-span-1 row-start-3 row-end-3"
      >
        <span className="text-base font-bold text-blue-600">
          {stats.averageMoves}
        </span>
      </InfoDisplayGrid>

      <InfoDisplayGrid
        title={GridInfo.strongestPlayer.title}
        help={GridInfo.strongestPlayer.help}
        className="col-span-1 row-start-4 row-end-4 "
      >
        <div className="text-base font-bold text-purple-600 text-center leading-tight">
          {stats.strongestPlayer.name}
        </div>
      </InfoDisplayGrid>

      <InfoDisplayGrid
        title={GridInfo.eloTrend.title}
        help={GridInfo.eloTrend.help}
        className="col-span-2 row-span-2"
      >
        <div className="flex items-center justify-center h-full w-full">
          <EloTrendGraph
            data={sampleEloTrendData}
            className="w-full h-full"
          />
        </div>
      </InfoDisplayGrid>

      <InfoDisplayGrid
        title={GridInfo.bestMoveAfter.title}
        help={GridInfo.bestMoveAfter.help}
        className="col-span-2 row-span-2"
      >
        <div className="flex items-center justify-center h-full w-full">
          <BestMoveChart
            data={sampleBestMoveData}
            className="w-full h-full flex items-center justify-center"
          />
        </div>
      </InfoDisplayGrid>
    </div>
  );
}

export default InfoDisplay;
