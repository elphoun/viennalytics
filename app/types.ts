// Opening Explorer Types
interface Player {
  name: string;
  elo: number;
}

type Result = 'white' | 'black' | 'draw';

interface PopularNextMove {
  eval: number;
  fen: string;
  move: string;
}

interface TopGame {
  white: string;
  black: string;
  result: Result;
  event: string;
  studyName: string;
  numMoves: number;
  gameURL: string;
}

interface Variant {
  averageMoves: number;
  drawPercentage: number;
  fen: string;
  openingEval: number;
  openingMoves: string[];
  playerElos: Player[];
  popularNextMoves: PopularNextMove[];
  strongestPlayer: string;
  topGames: TopGame[];
  totalGames: number;
  variation: string;
  winPercentageBlack: number;
  winPercentageWhite: number;
}

interface Opening {
  opening: string;
  variations: Variant[];
}

type OpeningStats = Opening[];

export type {
  Player,
  PopularNextMove,
  TopGame,
  Variant,
  Opening,
  OpeningStats,
  Result,
};
