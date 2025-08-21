import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import EvalBar from '../ui/EvalBar';
import { ChessboardManager } from './chessboard';

interface Props {
  openingData: any;
}

const ChessboardPanel = memo(function ChessboardPanel({ openingData }: Props) {
  const [chessboardManager, setChessboardManager] =
    useState<ChessboardManager | null>(null);
  const [currentPosition, setCurrentPosition] = useState<string>('');
  const [moves, setMoves] = useState<any[]>([]);
  const [evaluation, setEvaluation] = useState<number>(50);
  const [positionStatus, setPositionStatus] = useState<
    'normal' | 'check' | 'checkmate' | 'stalemate'
  >('normal');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState<number>(380);

  const initialPosition = useMemo(
    () =>
      openingData?.fen ||
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    [openingData?.fen]
  );

  // Initialize chessboard manager with useCallback for better performance
  const initializeChessboard = useCallback(() => {
    const manager = new ChessboardManager(initialPosition);
    setChessboardManager(manager);
    setCurrentPosition(manager.getPosition());
    setMoves([]);
    setEvaluation(manager.getPositionEvaluation());
    setPositionStatus(manager.getPositionStatus());
  }, [initialPosition]);

  useEffect(() => {
    initializeChessboard();
  }, [initializeChessboard]);

  // Optimized resize observer with debouncing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timeoutId: NodeJS.Timeout;
    const resize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const padding = 32; // Account for container padding
        const max = 400; // Maximum board size
        const min = 200; // Minimum board size
        const containerWidth = el.clientWidth;
        const availableWidth = containerWidth - padding - 100; // Leave space for EvalBar
        const w = Math.max(min, Math.min(max, availableWidth));
        setBoardWidth(w);
      }, 100);
    };

    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(el);
    return () => {
      clearTimeout(timeoutId);
      ro.disconnect();
    };
  }, []);

  const handlePieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      if (!chessboardManager || !targetSquare) return false;

      const moveSuccessful = chessboardManager.makeMove(
        sourceSquare,
        targetSquare
      );
      if (moveSuccessful) {
        setCurrentPosition(chessboardManager.getPosition());
        setMoves(chessboardManager.getMoves());
        setEvaluation(chessboardManager.getPositionEvaluation());
        setPositionStatus(chessboardManager.getPositionStatus());
      }

      return moveSuccessful;
    },
    [chessboardManager]
  );

  // Keep evaluation and status in sync whenever position changes.
  useEffect(() => {
    if (!chessboardManager) return;
    const evalValue = chessboardManager.getPositionEvaluation();
    const statusValue = chessboardManager.getPositionStatus();
    setEvaluation(evalValue);
    setPositionStatus(statusValue);
  }, [chessboardManager, currentPosition]);

  const handleReset = useCallback(() => {
    if (chessboardManager) {
      chessboardManager.reset();
      setCurrentPosition(chessboardManager.getPosition());
      setMoves([]);
      setEvaluation(chessboardManager.getPositionEvaluation());
      setPositionStatus(chessboardManager.getPositionStatus());
    }
  }, [chessboardManager]);

  const handleContentMoveClick = useCallback(
    (moveIndex: number) => {
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
    },
    [chessboardManager, openingData?.openingMoves]
  );

  const contentMoves = useMemo(() => {
    const openingMoves = openingData?.openingMoves || [];

    if (!openingMoves.length && !moves.length) {
      return (
        <span className='bg-slate-700/50 p-2 rounded mx-2 text-slate-300'>
          No Moves To Display
        </span>
      );
    }

    const openingMoveButtons = openingMoves.map(
      (move: string, index: number) => (
        <button
          key={`opening-${move}-${index}`}
          className='px-3 py-2 rounded text-sm text-nowrap even:bg-black/10 odd:bg-white/10 hover:bg-blue-600/30 text-blue-200 hover:text-blue-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 border border-blue-500/30 hover:border-blue-500/50'
          onClick={() => handleContentMoveClick(index)}
          aria-label={`Go to opening move ${index + 1}: ${move}`}
        >
          {move}
        </button>
      )
    );

    const userMoveButtons = moves.map((move: any, index: number) => (
      <button
        key={`user-${move.san}-${index}`}
        className='px-3 py-2 rounded text-sm text-nowrap bg-orange-600/30 hover:bg-slate-600/50 text-slate-200 hover:text-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 border border-slate-500/30 hover:border-slate-500/50'
        onClick={() =>
          handleContentMoveClick(
            index + (openingData?.openingMoves?.length || 0)
          )
        }
        aria-label={`Go to user move ${index + 1}: ${move.san}`}
      >
        {move.san}
      </button>
    ));

    return [...openingMoveButtons, ...userMoveButtons];
  }, [openingData?.openingMoves, moves, handleContentMoveClick]);

  return (
    <div
      ref={containerRef}
      className='flex flex-col items-center justify-center bg-slate-800/30 rounded-lg p-4 border border-slate-700/50'
      role='region'
      aria-label='Chess position explorer'
    >
      <div className='flex flex-row w-full gap-3 mb-4'>
        <button
          onClick={handleReset}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-xl'
          aria-label='Reset chess position to starting position'
        >
          Reset
        </button>
        <div className='flex-1 flex flex-nowrap max-w-full ring-1 p-1 bg-slate-700/20 ring-slate-700/50 rounded-lg gap-2 items-center overflow-x-auto scrollbar-hide'>
          {contentMoves}
        </div>
      </div>

      <div className='flex flex-row items-center justify-center gap-4 min-h-0'>
        <div className='flex items-center justify-center min-h-0'>
          <div
            style={{ width: boardWidth, height: boardWidth }}
            className='relative flex-shrink-0'
            role='img'
            aria-label={`Chess position: ${positionStatus === 'check' ? 'Check' : positionStatus === 'checkmate' ? 'Checkmate' : positionStatus === 'stalemate' ? 'Stalemate' : 'Normal position'}`}
          >
            <Chessboard
              key={`chessboard-${currentPosition}`}
              options={{
                position: currentPosition,
                onPieceDrop: handlePieceDrop,
                boardOrientation: 'white',
                boardStyle: {
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                },
                darkSquareStyle: { backgroundColor: '#475569' },
                lightSquareStyle: { backgroundColor: '#94a3b8' },
                dropSquareStyle: {
                  backgroundColor: 'rgba(59, 130, 246, 0.3)',
                  boxShadow: 'inset 0 0 1px 6px rgba(59, 130, 246, 0.5)',
                },
              }}
            />
          </div>
        </div>

        <EvalBar evaluation={evaluation} />
      </div>
    </div>
  );
});

export default ChessboardPanel;
