import { lazy, Suspense } from 'react';

// Lazy load the heavy react-chessboard component
const ChessboardComponent = lazy(async () => {
  const module = await import('react-chessboard');
  return { default: module.Chessboard };
});

// Define proper props interface based on react-chessboard v5 API
interface ChessboardLazyProps {
  position: string;
  onPieceDrop?: ({ piece, sourceSquare, targetSquare }: { piece: string; sourceSquare: string; targetSquare: string }) => boolean;
  arePiecesDraggable?: boolean;
  areArrowsAllowed?: boolean;
  showBoardNotation?: boolean;
  boardStyle?: Record<string, any>;
  customBoardStyle?: Record<string, any>;
}

const ChessboardLazy = (props: ChessboardLazyProps) => {
  // Temporary debug
  if (props.position) {
    // eslint-disable-next-line no-console
    console.log('Chessboard position:', props.position);
  }
  
  return (
    <Suspense 
      fallback={
        <div className="w-full aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
          <div className="text-amber-800 font-semibold">Loading board...</div>
        </div>
      }
    >
      <ChessboardComponent options={props as any} />
    </Suspense>
  );
};

export default ChessboardLazy;
