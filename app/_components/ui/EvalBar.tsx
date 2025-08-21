import { memo } from 'react';
import { cn } from '@/app/utils';

interface EvalBarProps {
  /**
   * The evaluation score, expected to be a percentage (0-100)
   * representing the white player's advantage.
   * 50 means an equal position.
   * > 50 means white has an advantage.
   * < 50 means black has an advantage.
   */
  evaluation: number;
  /**
   * Position status for special display states
   */
  status?: 'normal' | 'check' | 'checkmate' | 'stalemate';
}

const SET_DEFAULT_EVALUATION = 50;

const EvalBar = memo(({ evaluation, status = 'normal' }: EvalBarProps) => {
  // Handle special game states
  let displayEval = evaluation;
  let displayText = '';

  if (status === 'checkmate') {
    // Determine winner based on current evaluation trend
    displayEval = evaluation > 50 ? 100 : 0;
    displayText = evaluation > 50 ? '1-0' : '0-1';
  } else if (status === 'stalemate') {
    displayEval = 50;
    displayText = '½-½';
  } else if (status === 'check') {
    displayText = 'CHECK';
  } else {
    // Convert evaluation to a more readable format
    const centipawns = (evaluation - 50) * 2; // Convert to rough centipawn equivalent
    displayText =
      centipawns > 0 ? `+${centipawns.toFixed(1)}` : centipawns.toFixed(1);
  }

  // If evaluation is undefined, null, or not a number, treat as 50 (equal)
  const safeEval = displayEval || SET_DEFAULT_EVALUATION;
  const whitePercentage = Math.max(0, Math.min(100, safeEval));
  const blackPercentage = 100 - whitePercentage;

  // Determine text color and background based on the position
  const isTextOnBlack = blackPercentage > 50;
  const textColorClass = isTextOnBlack ? 'text-white' : 'text-black';

  // Add special styling for game-ending states
  const isGameOver = status === 'checkmate' || status === 'stalemate';
  const isCheck = status === 'check';

  return (
    <div className='relative h-[400px] w-6 flex-shrink-0'>
      <div
        className={cn(
          'h-full w-full flex flex-col overflow-hidden rounded-lg bg-slate-700 border border-slate-600',
          isGameOver && 'ring-2 ring-yellow-400',
          isCheck && 'ring-2 ring-red-400'
        )}
      >
        <div
          className={cn(
            'w-full transition-all duration-300 ease-in-out',
            status === 'checkmate' && evaluation < 50
              ? 'bg-green-600'
              : 'bg-slate-900'
          )}
          style={{ height: `${blackPercentage}%` }}
        />
        <div
          className={cn(
            'w-full transition-all duration-300 ease-in-out',
            status === 'checkmate' && evaluation > 50
              ? 'bg-green-600'
              : 'bg-slate-100'
          )}
          style={{ height: `${whitePercentage}%` }}
        />
      </div>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span
          className={cn(
            'font-bold text-xs pointer-events-none px-1 py-0.5 rounded bg-slate-600',
            textColorClass,
            isGameOver && 'bg-yellow-400 text-black',
            isCheck && 'bg-red-400 text-white'
          )}
          style={{
            textShadow:
              !isGameOver && !isCheck
                ? '1px 1px 2px rgba(0, 0, 0, 0.5)'
                : 'none',
            transform: 'rotate(-90deg)',
            whiteSpace: 'nowrap',
          }}
        >
          {displayText}
        </span>
      </div>
    </div>
  );
});

EvalBar.displayName = 'EvalBar';

export default EvalBar;
