// ─ Openings Database ─────────────────────────────────────────────────────────────────────────────
/** Represents a list of next moves */
interface NextMoves {
  move: string;
  fen: string;
  eval: number;
}

/** Represents a variant of an opening */
interface Variation {
  variation: string,
  openingMoves: string[],
  fen: string,
  openingEval: number,
  totalGames: number,
  winPercentageWhite: number,
  winPercentageBlack: number,
  drawPercentage: number,
  averageMoves: number,
  strongestPlayer: string,
  popularNextMoves: NextMoves[],
  playerElos: Player[]
  moveList: string[],
  numMoves: number,
  topGames: GameDisplay[]
}

/** Represents an opening */
interface Opening {
  opening: string,
  variations: Variation[],
}

/** List of chess game data entries. */
type GameDataList = Opening[];

// ─ Reports Database ─────────────────────────────────────────────────────────────────────────────
interface GameDisplay {
  white: Player,
  black: Player,
  result: Result,
  numMoves: number,
  event: string,
  studyName: string,
  gameURL: string
}

/** Describes a Chess Game */
interface Game {
  white: Player,
  black: Player,
  result: Result,
  opening: string,
  variation: string,
  openingFen: string,
  finalFen: string,
  openingEval: string,
  moveList: string[],
  numMoves: number,
  topGames: GameDisplay[]
}


// ─ Default Database ─────────────────────────────────────────────────────────────────────────────

/** Possible results of a chess game. */
type Result = 'white' | 'black' | 'draw';


/** Represents a chess player with a name and Elo rating. */
interface Player {
  elo: number;
  name: string;
}

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export type {
  Player,
  NextMoves,
  Variation,
  Opening,
  GameDataList,
  Result,
  Game,
  GameDisplay,
}
