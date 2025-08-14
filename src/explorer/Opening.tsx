// ─ Imports ────────────────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useState } from "react"
import { Chessboard } from "react-chessboard"

import EvalBar from "./EvalBar"
import GameCard from "./GameCard"
import InfoDisplay from "./info-display/InfoDisplay"
import OpeningSearch from "./search/OpeningSearch"
import VariantDropdown from "./search/VariantDropdown"
import ReportIcon from "../containers/header/ReportIcon"
import MainContainer from "../containers/MainContainer"
import PageTitle from "../containers/PageTitle"
import useDebounce from "../hooks/useDebounce"
import { useOpenings } from "../context/useContext"

// Custom Reset Icon Component
const ResetIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

// ─ Constants ──────────────────────────────────────────────────────────────────────────────────────
const CONTENT = {
  title: "Opening Explorer",
  loading: "Loading openings...",
  moveless: "NO VALID MOVES"
}

const DEFAULTFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** Opening Displays the Chess Opening Explorer Page */
const Opening = () => {
  const [openingSearch, setOpeningSearch] = useState<string>("");
  const [variationSearch, setVariationSearch] = useState<string>("");
  const [gamePosition, setGamePosition] = useState<string>(DEFAULTFEN);
  const { openings, fetchOpenings, isLoading } = useOpenings();

  // Debounce search input for better performance
  const debouncedOpeningSearch = useDebounce(openingSearch, 300);

  // Fetches Opening on Render
  useEffect(() => {
    fetchOpenings();
  }, [])

  // Direct URL input handling
  useEffect(() => {
    const updateStateFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const openingParam = urlParams.get('opening');
      const variationParam = urlParams.get('variation');
      if (openingParam && variationParam) {
        try {
          const decodedOpening = decodeURIComponent(openingParam);
          const decodedVariation = decodeURIComponent(variationParam);
          setOpeningSearch(decodedOpening);
          setVariationSearch(decodedVariation);
        } catch {
          setOpeningSearch('');
          setVariationSearch('');
        }
      } else {
        setOpeningSearch('');
        setVariationSearch('');
      }
    };
    updateStateFromURL();
    window.addEventListener('popstate', updateStateFromURL);
    return () => {
      window.removeEventListener('popstate', updateStateFromURL);
    };
  }, []);

  // Memoize filtered openings based on search with early return optimization
  const filteredOpenings = useMemo(() => {
    if (!debouncedOpeningSearch.trim()) { return openings; }

    const searchTerm = debouncedOpeningSearch.toLowerCase();

    const maxResults = 50;

    // Prioritize exact matches first, then partial matches
    const exactMatches = [];
    const partialMatches = [];

    for (let i = 0; i < openings.length && (exactMatches.length + partialMatches.length) < maxResults; i++) {
      const openingName = openings[i].opening.toLowerCase();
      if (openingName === searchTerm) {
        exactMatches.push(openings[i]);
      } else if (openingName.includes(searchTerm)) {
        partialMatches.push(openings[i]);
      }
    }

    return [...exactMatches, ...partialMatches.slice(0, maxResults - exactMatches.length)];
  }, [openings, debouncedOpeningSearch]);

  // Get the first matching opening or exact match
  const selectedOpening = useMemo(() => {
    if (!debouncedOpeningSearch.trim()) { return null; }
    const exactMatch = filteredOpenings.find(opening =>
      opening.opening.toLowerCase() === debouncedOpeningSearch.toLowerCase()
    );
    return exactMatch || filteredOpenings[0] || null;
  }, [filteredOpenings, debouncedOpeningSearch]);

  // Memoize selected variation data
  const openingData = useMemo(() =>
    selectedOpening?.variations.find(variation => variation.variation === variationSearch),
    [selectedOpening, variationSearch]
  );

  const data = useMemo(() => {
    const hasTopGames = Boolean(openingData?.topGames.length);
    return (hasTopGames && openingData?.topGames ?
      (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
        {openingData.topGames.slice(0, 20).map((game) => (
          <GameCard key={game.gameURL} game={game} />
        ))}
      </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          No games available for this variation
        </div>
      )
    )
  }, [openingData])

  // Memoize variation options
  const variationOptions = useMemo(() =>
    selectedOpening?.variations.map(variation => variation.variation) || [],
    [selectedOpening]
  );

  // Update URL when opening or variation changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      let hasChanges = false;

      const currentOpening = params.get('opening');
      const currentVariation = params.get('variation');

      const newOpening = selectedOpening?.opening ? encodeURIComponent(selectedOpening.opening) : null;
      const newVariation = variationSearch && selectedOpening ? encodeURIComponent(variationSearch) : null;

      if (currentOpening !== newOpening) {
        hasChanges = true;
        if (newOpening) { params.set('opening', newOpening); }
        else { params.delete('opening'); }
      }

      if (currentVariation !== newVariation) {
        hasChanges = true;
        if (newVariation) { params.set('variation', newVariation); }
        else { params.delete('variation'); }
      }

      if (hasChanges) {
        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedOpening?.opening, variationSearch]);

  // Auto-select first variation when opening changes
  useEffect(() => {
    if (variationOptions.length > 0 && !variationOptions.includes(variationSearch)) {
      setVariationSearch(variationOptions[0]);
    } else if (variationOptions.length === 0) {
      setVariationSearch("");
    }
  }, [variationOptions, variationSearch]);

  // Opening search handler
  const handleOpeningSearch = useCallback((value: string) => {
    setOpeningSearch(value);
  }, [])

  // Variation select handler
  const handleVariationSearch = useCallback((value: string) => {
    setVariationSearch(value);
  }, []);

  // Memoize moves rendering separately to avoid re-rendering when only eval changes
  const contentMoves = useMemo(() => {
    if (!openingData?.openingMoves.length) { return <span className="text-gray-400">{CONTENT.moveless}</span>; }
    return openingData.openingMoves.map((move: string, index: number) => (
      // eslint-disable-next-line react/no-array-index-key
      <span key={`${move}-${index}`} className="px-2 py-1 bg-white/20 rounded text-sm text-nowrap">
        {move}
      </span>
    ));
  }, [openingData?.openingMoves]);

  // Display Data - split into separate memos for better granular updates
  const contentFEN = useMemo(() => gamePosition, [gamePosition]);
  const contentEval = useMemo(() => openingData?.openingEval ?? 0, [openingData?.openingEval]);

  // Update game position when opening data changes
  useEffect(() => {
    if (openingData?.fen) {
      setGamePosition(openingData.fen);
    } else {
      setGamePosition(DEFAULTFEN);
    }
  }, [openingData?.fen]);

  // Reset board to original opening position
  const handleResetBoard = useCallback(() => {
    if (openingData?.fen) {
      setGamePosition(openingData.fen);
    } else {
      setGamePosition(DEFAULTFEN);
    }
  }, [openingData?.fen]);

  // Basic chess move validation function
  const isValidMove = useCallback((sourceSquare: string, targetSquare: string, position: string) => {
    // Parse FEN to get board state
    const fenParts = position.split(' ');
    const boardState = fenParts[0];
    const activeColor = fenParts[1];

    // Validate square format
    if (!sourceSquare || !targetSquare || sourceSquare.length !== 2 || targetSquare.length !== 2) {
      return false;
    }

    // Convert square notation to coordinates
    const sourceFile = sourceSquare.charCodeAt(0) - 97; // a=0, b=1, etc.
    const sourceRank = parseInt(sourceSquare[1], 10) - 1;
    const targetFile = targetSquare.charCodeAt(0) - 97;
    const targetRank = parseInt(targetSquare[1], 10) - 1;

    // Validate coordinates are within bounds
    if (sourceFile < 0 || sourceFile > 7 || sourceRank < 0 || sourceRank > 7 ||
      targetFile < 0 || targetFile > 7 || targetRank < 0 || targetRank > 7) {
      return false;
    }

    // Create board array from FEN
    const board: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    const rows = boardState.split('/');

    for (let rank = 0; rank < 8; rank++) {
      let file = 0;
      for (const char of rows[rank]) {
        if (char >= '1' && char <= '8') {
          file += parseInt(char, 10);
        } else {
          board[7 - rank][file] = char;
          file++;
        }
      }
    }

    // Safely access board positions
    const sourcePiece = board[sourceRank]?.[sourceFile] || null;
    const targetPiece = board[targetRank]?.[targetFile] || null;

    // Basic validation
    if (!sourcePiece) {
      return false; // No piece at source
    }

    // Check if it's the right player's turn
    const isWhitePiece = sourcePiece === sourcePiece.toUpperCase();
    if ((activeColor === 'w' && !isWhitePiece) || (activeColor === 'b' && isWhitePiece)) {
      return false;
    }

    // Can't capture own piece
    if (targetPiece) {
      const isTargetWhite = targetPiece === targetPiece.toUpperCase();
      if (isWhitePiece === isTargetWhite) return false;
    }

    // Basic piece movement validation (simplified)
    const piece = sourcePiece.toLowerCase();
    const fileDiff = Math.abs(targetFile - sourceFile);
    const rankDiff = Math.abs(targetRank - sourceRank);

    switch (piece) {
      case 'p': // Pawn
        const direction = isWhitePiece ? 1 : -1;
        const startRank = isWhitePiece ? 1 : 6;
        const enPassantSquare = fenParts[3];

        if (targetFile === sourceFile) { // Forward move
          if (targetRank === sourceRank + direction && !targetPiece) return true;
          if (sourceRank === startRank && targetRank === sourceRank + 2 * direction && !targetPiece) return true;
        } else if (fileDiff === 1 && targetRank === sourceRank + direction) {
          // Regular capture
          if (targetPiece) return true;
          // En passant capture
          if (enPassantSquare !== '-' && targetSquare === enPassantSquare) {
            return true;
          }
        }
        return false;

      case 'r': // Rook
        return (fileDiff === 0 || rankDiff === 0);

      case 'n': // Knight
        return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);

      case 'b': // Bishop
        return fileDiff === rankDiff;

      case 'q': // Queen
        return fileDiff === rankDiff || fileDiff === 0 || rankDiff === 0;

      case 'k': // King
        return fileDiff <= 1 && rankDiff <= 1;

      default:
        return false;
    }
  }, []);

  // Make move function
  const makeMove = useCallback((sourceSquare: string, targetSquare: string) => {
    const fenParts = gamePosition.split(' ');
    const boardState = fenParts[0];
    const activeColor = fenParts[1];
    const castling = fenParts[2];
    let halfmove = parseInt(fenParts[4], 10);
    let fullmove = parseInt(fenParts[5], 10);

    // Create board array
    const board: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    const rows = boardState.split('/');

    for (let rank = 0; rank < 8; rank++) {
      let file = 0;
      for (const char of rows[rank]) {
        if (char >= '1' && char <= '8') {
          file += parseInt(char, 10);
        } else {
          board[7 - rank][file] = char;
          file++;
        }
      }
    }

    // Make the move
    const sourceFile = sourceSquare.charCodeAt(0) - 97;
    const sourceRank = parseInt(sourceSquare[1], 10) - 1;
    const targetFile = targetSquare.charCodeAt(0) - 97;
    const targetRank = parseInt(targetSquare[1], 10) - 1;

    // Bounds checking
    if (sourceFile < 0 || sourceFile > 7 || sourceRank < 0 || sourceRank > 7 ||
      targetFile < 0 || targetFile > 7 || targetRank < 0 || targetRank > 7) {
      return false;
    }

    const piece = board[sourceRank]?.[sourceFile];
    if (!piece) {
      return false;
    }

    const isWhitePiece = piece === piece.toUpperCase();
    let newEnPassant = '-';

    // Handle en passant capture
    if (piece.toLowerCase() === 'p' && Math.abs(targetFile - sourceFile) === 1 && !board[targetRank][targetFile]) {
      // This is an en passant capture - remove the captured pawn
      const capturedPawnRank = isWhitePiece ? targetRank - 1 : targetRank + 1;
      board[capturedPawnRank][targetFile] = null;
    }

    // Check if this move creates an en passant opportunity
    if (piece.toLowerCase() === 'p' && Math.abs(targetRank - sourceRank) === 2) {
      // Pawn moved two squares, set en passant square
      const enPassantRank = isWhitePiece ? sourceRank + 1 : sourceRank - 1;
      newEnPassant = String.fromCharCode(97 + sourceFile) + (enPassantRank + 1);
    }

    // Make the move
    board[targetRank][targetFile] = piece;
    board[sourceRank][sourceFile] = null;

    // Convert board back to FEN
    let newBoardState = '';
    for (let rank = 7; rank >= 0; rank--) {
      let emptyCount = 0;
      for (let file = 0; file < 8; file++) {
        if (board[rank][file]) {
          if (emptyCount > 0) {
            newBoardState += emptyCount;
            emptyCount = 0;
          }
          newBoardState += board[rank][file];
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) newBoardState += emptyCount;
      if (rank > 0) newBoardState += '/';
    }

    // Update game state
    const newActiveColor = activeColor === 'w' ? 'b' : 'w';
    if (activeColor === 'b') fullmove++;

    // Reset halfmove clock on pawn move or capture
    if (piece.toLowerCase() === 'p' || board[targetRank][targetFile] !== piece) {
      halfmove = 0;
    } else {
      halfmove++;
    }

    const newFEN = `${newBoardState} ${newActiveColor} ${castling} ${newEnPassant} ${halfmove} ${fullmove}`;
    setGamePosition(newFEN);

    return true;
  }, [gamePosition]);

  // Memoize chessboard options to prevent unnecessary re-renders
  const chessboardOptions = useMemo(() => ({
    position: contentFEN,
    arePiecesDraggable: true,
    areArrowsAllowed: false,
    showBoardNotation: true,

    animationDuration: 150,
    onPieceDrop: ({ sourceSquare, targetSquare }: { piece: any; sourceSquare: string; targetSquare: string | null }) => {
      try {
        if (!targetSquare) { return false; }
        if (isValidMove(sourceSquare, targetSquare, gamePosition)) {
          return makeMove(sourceSquare, targetSquare);
        }
        return false;
      } catch {
        return false;
      }
    },
    customBoardStyle: {
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
    }
  }), [contentFEN, isValidMove, makeMove, gamePosition]);


  // Show loading state
  if (isLoading) {
    return (
      <MainContainer>
        <PageTitle text={CONTENT.title} icon={<ReportIcon />} />
        <div className="h-full w-full flex flex-col gap-4">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-0 gap-4 p-2">
            <div className="flex flex-col gap-2 lg:col-span-1">
              <div className="flex flex-col sm:flex-row w-full gap-3 h-auto sm:h-10">
                <div className="flex-1 h-10 bg-white/10 rounded animate-pulse"></div>
                <div className="w-full sm:w-48 h-10 bg-white/10 rounded animate-pulse"></div>
              </div>
              <div className="w-full h-[2.5rem] bg-white/10 rounded animate-pulse"></div>
              <div className="w-full h-10 bg-white/10 rounded animate-pulse"></div>
              <div className="flex items-center justify-center gap-3 mx-auto max-w-full">
                <div className="h-[300px] sm:h-[350px] md:h-[400px] w-6 bg-white/10 rounded animate-pulse"></div>
                <div className="w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px] aspect-square mx-auto bg-white/10 rounded-lg animate-pulse shadow-lg"></div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex-shrink-0 h-64 bg-white/10 rounded-lg animate-pulse"></div>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <PageTitle text={CONTENT.title} icon={<ReportIcon />} />

      <div className="h-full w-full flex flex-col gap-4">

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-0 gap-4 p-2">

          {/* Left Column - Board and Controls */}
          <div className="flex flex-col gap-2 lg:col-span-1">

            {/* Search Controls */}
            <div className="flex flex-col sm:flex-row w-full gap-3 h-auto sm:h-10">
              <div className="flex-1 min-w-0">
                <OpeningSearch
                  placeholder="Search openings..."
                  value={openingSearch}
                  onAction={handleOpeningSearch}
                />
              </div>
              <div className="w-full sm:w-48 min-w-0">
                <VariantDropdown
                  options={variationOptions}
                  value={variationSearch}
                  onSelect={handleVariationSearch}
                  disabled={variationOptions.length === 0}
                />
              </div>
            </div>

            {/* Moves Display */}
            <div className="w-full flex items-center gap-2 h-[2.5rem] flex-nowrap overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {contentMoves}
            </div>

            {/* Reset Button */}
            <div className="w-full flex justify-center h-10">
              <button
                onClick={handleResetBoard}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                type="button"
              >
                <span className="hidden sm:inline">Reset Board</span>
                <span className="sm:hidden">Reset</span>
                <ResetIcon />
              </button>
            </div>

            {/* Board and Eval Bar */}
            <div className="flex items-center justify-center gap-3 mx-auto max-w-full">
              <div className="h-[300px] sm:h-[350px] md:h-[400px] w-6 flex-shrink-0">
                <EvalBar evaluation={contentEval} />
              </div>
              <div className="w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px] aspect-square mx-auto rounded-lg overflow-hidden shadow-lg bg-gray-200">
                <Chessboard options={chessboardOptions} />
              </div>
            </div>
          </div>

          {/* Right Column - Info Display */}
          <div className="lg:col-span-2 flex flex-col min-h-0 bg-white/10 rounded-lg shadow-md ring-1 ring-black/5">
            <InfoDisplay variation={openingData} />
          </div>
        </div>

        {/* Bottom Section - Top Games */}
        <div className="flex-shrink-0 min-h-[300px] bg-white/10 rounded-lg shadow-md ring-1 ring-black/5 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Top Games</h3>
          <div className="overflow-y-auto max-h-[400px]">
            {data}
          </div>
        </div>
      </div>
    </MainContainer>

  )
}

// ─ Exports ────────────────────────────────────────────────────────────────────────────────────────
export default Opening;