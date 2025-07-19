import InfoDisplayGrid from "../components/UI/InfoDisplayGrid";

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
    <div className="p-2 grid h-full w-full grid-cols-3 gap-6">
      <InfoDisplayGrid
        title={GridInfo.winLossDraw.title}
        smallTitle={GridInfo.winLossDraw.smallTitle}
        help={GridInfo.winLossDraw.help}
        className="col-span-1 row-start-1 row-end-1 text-xl min-h-[110px]"
      >
        <div className="flex flex-row items-center justify-center h-full w-full text-lg flex-wrap gap-2">
          <span className="text-green-600 font-bold">{stats.winPercentage}{CONTENT.percentage}</span>
          <span>{CONTENT.separator}</span>
          <span className="text-red-600 font-bold">{stats.lossPercentage}{CONTENT.percentage}</span>
          <span>{CONTENT.separator}</span>
          <span className="text-yellow-600 font-bold">{stats.drawPercentage}{CONTENT.percentage}</span>
        </div>
      </InfoDisplayGrid>

      <InfoDisplayGrid
        title={GridInfo.openingEval.title}
        help={GridInfo.openingEval.help}
        className="col-span-1 row-start-2 row-end-2 text-xl min-h-[110px]"
      >
        <div className="flex items-center justify-center h-full w-full">
          <span className="text-2xl font-semibold text-gray-600">
            {CONTENT.notAvailable}
          </span>
        </div>
      </InfoDisplayGrid>

      <InfoDisplayGrid
        title={GridInfo.averageMoves.title}
        smallTitle={GridInfo.averageMoves.smallTitle}
        help={GridInfo.averageMoves.help}
        className="col-span-1 row-start-3 row-end-3 text-xl min-h-[110px]"
      >
        <div className="flex items-center justify-center h-full w-full">
          <span className="text-3xl font-bold text-blue-600">
            {stats.averageMoves}
          </span>
        </div>
      </InfoDisplayGrid>

      <InfoDisplayGrid
        title={GridInfo.eloTrend.title}
        help={GridInfo.eloTrend.help}
        className="col-span-2 row-span-2 text-xl min-h-[110px]"
      >
        <div className="flex items-center justify-center h-full w-full">
          <span className="text-lg text-gray-600">
            {CONTENT.eloTrendNotAvailable}
          </span>
        </div>
      </InfoDisplayGrid>

      <InfoDisplayGrid
        title={GridInfo.strongestPlayer.title}
        help={GridInfo.strongestPlayer.help}
        className="col-span-1 row-start-4 row-end-4 text-xl min-h-[110px]"
      >
        <div className="flex flex-col items-center justify-center h-full w-full p-4">
          <div className="text-base font-bold text-purple-600 mb-2">
            {stats.strongestPlayer.name}
          </div>
        </div>
      </InfoDisplayGrid>

      <InfoDisplayGrid
        title={GridInfo.bestMoveAfter.title}
        help={GridInfo.bestMoveAfter.help}
        className="col-span-2 row-span-2 text-xl min-h-[110px]"
      >
        <div className="flex items-center justify-center h-full w-full">
          <span className="text-lg text-gray-600">
            {CONTENT.bestMoveNotAvailable}
          </span>
        </div>
      </InfoDisplayGrid>
    </div>
  );
}

export default InfoDisplay;
