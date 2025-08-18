import React, { memo, useMemo, useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { ChessboardManager } from './chessboard';
import EvalBar from '../ui/EvalBar';

interface Props {
  openingData: any;
}

const ChessboardPanel = memo(function ChessboardPanel({ openingData }: Props) {
  const [chessboardManager, setChessboardManager] = useState<ChessboardManager | null>(null);
  const [currentPosition, setCurrentPosition] = useState<string>('');
  const [moves, setMoves] = useState<any[]>([]);
  const [evaluation, setEvaluation] = useState<number>(50);
  const [positionStatus, setPositionStatus] = useState<'normal' | 'check' | 'checkmate' | 'stalemate'>('normal');

  const initialPosition = useMemo(() =>
    openingData?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    [openingData?.fen]
  );

  useEffect(() => {
    const manager = new ChessboardManager(initialPosition);
    setChessboardManager(manager);
    setCurrentPosition(manager.getPosition());
    setMoves([]);
    setEvaluation(manager.getPositionEvaluation());
    setPositionStatus(manager.getPositionStatus());
  }, [initialPosition]);

  const handlePieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null; }): boolean => {
    if (!chessboardManager || !targetSquare) return false;

    const moveSuccessful = chessboardManager.makeMove(sourceSquare, targetSquare);
    if (moveSuccessful) {
      setCurrentPosition(chessboardManager.getPosition());
      setMoves(chessboardManager.getMoves());
      setEvaluation(chessboardManager.getPositionEvaluation());
      setPositionStatus(chessboardManager.getPositionStatus());
    }

    return moveSuccessful;
  };

  const handleReset = () => {
    if (chessboardManager) {
      chessboardManager.reset();
      setCurrentPosition(chessboardManager.getPosition());
      setMoves([]);
      setEvaluation(chessboardManager.getPositionEvaluation());
      setPositionStatus(chessboardManager.getPositionStatus());
    }
  };

  const handleContentMoveClick = (moveIndex: number) => {
    if (!chessboardManager) return;

    const openingMoves = openingData?.openingMoves || [];

    if (moveIndex < openingMoves.length) {
      chessboardManager.setToOpeningMove(openingMoves, moveIndex);
    } else {
      const userMoveIndex = moveIndex - openingMoves.length;
      chessboardManager.revertToMove(userMoveIndex);
    }

    setCurrentPosition(chessboardManager.getPosition());
    setMoves(chessboardManager.getMoves());
    setEvaluation(chessboardManager.getPositionEvaluation());
    setPositionStatus(chessboardManager.getPositionStatus());
  };

  const contentMoves = useMemo(() => {
    const openingMoves = openingData?.openingMoves || [];
    const userMoves = moves.map(move => move.san);
    const allMoves = [...openingMoves, ...userMoves];

    if (!allMoves.length) {
      return <span className="bg-amber-50/10 p-2 rounded mx-2 text-gray-400">No Moves To Display</span>;
    }

    return allMoves.map((move: string, index: number) => {
      const isOpeningMove = index < openingMoves.length;
      return (
        <span
          key={`${move}-${index}`}
          className={`px-2 py-1 rounded text-sm text-nowrap cursor-pointer transition-colors ${isOpeningMove
            ? 'bg-white/20 hover:bg-white/30'
            : 'bg-blue-500/30 border border-blue-400/50 hover:bg-blue-500/40'
            }`}
          onClick={() => handleContentMoveClick(index)}
        >
          {move}
        </span>
      );
    });
  }, [openingData?.openingMoves, moves]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-row gap-2">
        <div className="w-full flex items-center gap-2 h-[2.5rem] flex-nowrap overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {contentMoves}
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
      </div>

      <div className="flex flex-row gap-2">
        <EvalBar evaluation={evaluation} status={positionStatus} />
        <Chessboard options={{
          position: currentPosition,
          onPieceDrop: handlePieceDrop,
          allowDragging: true,
          allowDrawingArrows: true,
          boardStyle: {
            width: "400px",
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          },
          darkSquareStyle: { backgroundColor: '#779952' },
          lightSquareStyle: { backgroundColor: '#edeed1' },
          dropSquareStyle: {
            boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)'
          }
        }} />
      </div>
    </div>
  );
});

ChessboardPanel.displayName = 'ChessboardPanel';

export default ChessboardPanel;
