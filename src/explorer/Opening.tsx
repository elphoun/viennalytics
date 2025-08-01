// ─ Imports ────────────────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useState } from "react"

import EvalBar from "./EvalBar"
import GameCard from "./GameCard"
import InfoDisplay from "./info-display/InfoDisplay"
import OpeningSearch from "./search/OpeningSearch"
import VariantDropdown from "./search/VariantDropdown"
import ReportIcon from "../containers/header/ReportIcon"
import MainContainer from "../containers/MainContainer"
import Title from "../containers/Title"
import useDebounce from "../context/Providers/useDebounce"
import { useOpenings } from "../context/UseContext"
import ChessboardLazy from "./info-display/ChessboardLazy"


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
  const { openings, fetchOpenings, isLoading } = useOpenings();

  // Debounce search input for better performance
  const debouncedOpeningSearch = useDebounce(openingSearch, 300);

  // Fetches Opening on Render
  useEffect(() => {
    fetchOpenings();
  }, [fetchOpenings])

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
  const contentFEN = useMemo(() => openingData?.fen || DEFAULTFEN, [openingData?.fen]);
  const contentEval = useMemo(() => openingData?.openingEval ?? 0, [openingData?.openingEval]);

  // Memoize chessboard options to prevent unnecessary re-renders
  const chessboardOptions = useMemo(() => ({
    position: contentFEN,
    // Disable piece dropping for display-only board
    onPieceDrop: () => false,
    arePiecesDraggable: false,
    areArrowsAllowed: true,
    showBoardNotation: true,
    boardStyle: {
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
    },
    customBoardStyle: {
      borderRadius: '8px'
    }
  }), [contentFEN]);


  // Show loading state
  if (isLoading) {
    return (
      <MainContainer>
        <Title text={CONTENT.title} icon={<ReportIcon />} />
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-400 text-lg">{CONTENT.loading}</div>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Title text={CONTENT.title} icon={<ReportIcon />} />

      <div className="h-full w-full flex flex-col gap-4">

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 min-h-0 gap-4 p-2">

          {/* Left Column - Board and Controls */}
          <div className="flex flex-col gap-2">

            {/* Search Controls */}
            <div className="flex flex-row w-full gap-3">
              <OpeningSearch
                placeholder="Search openings..."
                value={openingSearch}
                onAction={handleOpeningSearch}
              />
              <VariantDropdown
                options={variationOptions}
                value={variationSearch}
                onSelect={handleVariationSearch}
                disabled={variationOptions.length === 0}
              />
            </div>

            {/* Moves Display */}
            <div className="w-full flex items-center gap-2 min-h-[2.5rem] max-h-20 flex-nowrap overflow-y-hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {contentMoves}
            </div>

            {/* Board and Eval Bar */}
            <div className="flex items-center justify-center gap-3 mx-auto max-w-full">
              <div className="h-full max-h-full w-6 flex-shrink-0">
                <EvalBar evaluation={contentEval} />
              </div>
              <div className="aspect-square w-full max-w-full h-full max-h-full rounded-lg overflow-hidden shadow-lg">
                <ChessboardLazy {...chessboardOptions} />
              </div>
            </div>
          </div>

          {/* Right Column - Info Display */}
          <div className="xl:col-span-2 flex flex-col min-h-0 bg-white/10 rounded-lg shadow-md ring-1 ring-black/5">
            <InfoDisplay variation={openingData} />
          </div>
        </div>

        {/* Bottom Section - Top Games */}
        <div className="flex-shrink-0 bg-white/10 rounded-lg shadow-md ring-1 ring-black/5 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Top Games</h3>
          {data}
        </div>

      </div>
    </MainContainer>
  )
}

// ─ Exports ────────────────────────────────────────────────────────────────────────────────────────
export default Opening;