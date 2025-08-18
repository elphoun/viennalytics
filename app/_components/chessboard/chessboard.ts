import { Chess, Move } from 'chess.js';

export interface ChessMove {
  from: string;
  to: string;
  san: string;
  fen: string;
  moveNumber: number;
}

export interface ChessboardState {
  position: string;
  moves: ChessMove[];
  game: Chess;
}

export class ChessboardManager {
  private game: Chess;
  private moves: ChessMove[] = [];
  private initialPosition: string;

  constructor(initialFen?: string) {
    this.initialPosition = initialFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    this.game = new Chess(this.initialPosition);
  }

  makeMove(from: string, to: string): boolean {
    try {
      const move = this.game.move({ from, to });
      if (move) {
        this.moves.push({
          from,
          to,
          san: move.san,
          fen: this.game.fen(),
          moveNumber: Math.floor(this.moves.length / 2) + 1
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  reset(): void {
    this.game = new Chess(this.initialPosition);
    this.moves = [];
  }

  getPosition(): string {
    return this.game.fen();
  }

  getMoves(): ChessMove[] {
    return [...this.moves];
  }

  getGame(): Chess {
    return this.game;
  }

  setInitialPosition(fen: string): void {
    this.initialPosition = fen;
    this.reset();
  }

  revertToMove(moveIndex: number): void {
    if (moveIndex < 0 || moveIndex >= this.moves.length) return;
    
    // Reset to initial position
    this.game = new Chess(this.initialPosition);
    
    // Replay moves up to the specified index
    const movesToReplay = this.moves.slice(0, moveIndex + 1);
    this.moves = [];
    
    for (const move of movesToReplay) {
      this.game.move({ from: move.from, to: move.to });
      this.moves.push(move);
    }
  }

  setToOpeningMove(openingMoves: string[], moveIndex: number): void {
    if (moveIndex < 0 || moveIndex >= openingMoves.length) return;
    
    // Reset to initial position
    this.game = new Chess(this.initialPosition);
    this.moves = [];
    
    // Play opening moves up to the specified index
    for (let i = 0; i <= moveIndex; i++) {
      try {
        const move = this.game.move(openingMoves[i]);
        if (move) {
          this.moves.push({
            from: move.from,
            to: move.to,
            san: move.san,
            fen: this.game.fen(),
            moveNumber: Math.floor(i / 2) + 1
          });
        }
      } catch {
        // If move is invalid, stop here
        break;
      }
    }
  }

  // Basic position evaluation based on material and position
  getPositionEvaluation(): number {
    const pieceValues = {
      'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'k': 0,
      'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0
    };

    let materialScore = 0;
    const board = this.game.board();
    
    // Calculate material balance
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          materialScore += pieceValues[piece.type] * (piece.color === 'w' ? 1 : -1);
        }
      }
    }

    // Add positional factors
    let positionalScore = 0;
    
    // Center control bonus
    const centerSquares = ['d4', 'd5', 'e4', 'e5'];
    centerSquares.forEach(square => {
      const piece = this.game.get(square as any);
      if (piece) {
        positionalScore += (piece.color === 'w' ? 0.3 : -0.3);
      }
    });

    // Development bonus (knights and bishops not on starting squares)
    const developmentSquares = {
      'w': ['b1', 'c1', 'f1', 'g1'],
      'b': ['b8', 'c8', 'f8', 'g8']
    };
    
    ['w', 'b'].forEach(color => {
      developmentSquares[color as 'w' | 'b'].forEach(square => {
        const piece = this.game.get(square as any);
        if (!piece || (piece.type !== 'n' && piece.type !== 'b')) {
          positionalScore += (color === 'w' ? 0.2 : -0.2);
        }
      });
    });

    const totalScore = materialScore + positionalScore;
    
    // Convert to percentage (50 = equal, >50 = white advantage, <50 = black advantage)
    // Clamp between reasonable bounds (-10 to +10 material advantage)
    const clampedScore = Math.max(-10, Math.min(10, totalScore));
    return 50 + (clampedScore * 5); // Scale to 0-100 range
  }

  // Check if position is in check, checkmate, or stalemate
  getPositionStatus(): 'normal' | 'check' | 'checkmate' | 'stalemate' {
    if (this.game.isCheckmate()) return 'checkmate';
    if (this.game.isStalemate()) return 'stalemate';
    if (this.game.inCheck()) return 'check';
    return 'normal';
  }
}