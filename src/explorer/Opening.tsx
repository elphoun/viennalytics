// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useMemo, useCallback } from "react";
import { Chessboard } from "react-chessboard";

import InfoDisplay from "./InfoDisplay";
import MainContainer from "../components/containers/MainContainer";
import Title from "../components/Text/Title";
import Button from "../components/ui/Button";
import Dropdown from "../components/ui/Dropdown";
import EvalBar from "../components/ui/EvalBar";
import InputField from "../components/ui/InputField";
import ReportIcon from "../components/ui/ReportIcon";
import { useOpenings } from "../context/UseContext";
import { useDebounce } from "../context/Providers/useDebounce";

// ─ Constants ────────────────────────────────────────────────────────────────────────────────────
const CONTENT = {
  title: "Opening Explorer"
}

// ─ Helper Functions ─────────────────────────────────────────────────────────────────────────────
const NO_MOVES_MSG = "No moves available.";

/**
 * Generates a shareable URL for the current opening and variation
 */
const generateShareableURL = (opening?: string, variation?: string): string => {
  const url = new URL(window.location.origin + window.location.pathname);
  const params = new URLSearchParams();

  if (opening) {
    params.set('opening', encodeURIComponent(opening));
  }
  if (variation) {
    params.set('variation', encodeURIComponent(variation));
  }

  return url.toString() + (params.toString() ? '?' + params.toString() : '');
};

/**
 * Opening component displays the chess opening explorer page with search, dropdown, and board.
 */
const Opening = () => {
  const [openingSearchInput, setOpeningSearchInput] = useState<string>("");
  const [variationSearch, setVariationSearch] = useState<string>("");
  const { openings, fetchOpenings, isLoading } = useOpenings();

  // Debounce search input for better performance
  const debouncedOpeningSearch = useDebounce(openingSearchInput, 300);

  // Initialize from URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const openingParam = urlParams.get('opening');
    const variationParam = urlParams.get('variation');

    if (openingParam) {
      try {
        setOpeningSearchInput(decodeURIComponent(openingParam));
      } catch (err) {
        console.warn('Invalid opening parameter in URL:', err, openingParam);
      }
    }
    if (variationParam) {
      try {
        setVariationSearch(decodeURIComponent(variationParam));
      } catch (err) {
        console.warn('Invalid variation parameter in URL: ', err, variationParam);
      }
    }
  }, []);

  // Fetch openings on mount
  useEffect(() => {
    fetchOpenings();
  }, [fetchOpenings]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const openingParam = urlParams.get('opening');
      const variationParam = urlParams.get('variation');

      if (openingParam) {
        try {
          setOpeningSearchInput(decodeURIComponent(openingParam));
        } catch (error) {
          console.warn('Invalid opening parameter in URL:', openingParam);
        }
      } else {
        setOpeningSearchInput("");
      }

      if (variationParam) {
        try {
          setVariationSearch(decodeURIComponent(variationParam));
        } catch (error) {
          console.warn('Invalid variation parameter in URL:', variationParam);
        }
      } else {
        setVariationSearch("");
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Memoize filtered openings based on search
  const filteredOpenings = useMemo(() => {
    if (!debouncedOpeningSearch.trim()) { return openings; }

    const searchTerm = debouncedOpeningSearch.toLowerCase();
    return openings.filter(opening =>
      opening.opening.toLowerCase().includes(searchTerm)
    );
  }, [openings, debouncedOpeningSearch]);

  // Get the first matching opening or exact match
  const selectedOpening = useMemo(() => {
    if (!debouncedOpeningSearch.trim()) { return null; }

    // Try exact match first
    const exactMatch = filteredOpenings.find(opening =>
      opening.opening.toLowerCase() === debouncedOpeningSearch.toLowerCase()
    );

    // Fall back to first filtered result
    return exactMatch || filteredOpenings[0] || null;
  }, [filteredOpenings, debouncedOpeningSearch]);

  // Memoize variation options
  const variationOptions = useMemo(() =>
    selectedOpening?.variations.map(variation => variation.variation) || [],
    [selectedOpening]
  );

  // Auto-select first variation when opening changes
  useEffect(() => {
    if (variationOptions.length > 0 && !variationOptions.includes(variationSearch)) {
      setVariationSearch(variationOptions[0]);
    } else if (variationOptions.length === 0) {
      setVariationSearch("");
    }
  }, [variationOptions, variationSearch]);

  // Update URL when opening or variation changes
  useEffect(() => {
    const updateURL = () => {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);

      if (selectedOpening?.opening) {
        params.set('opening', encodeURIComponent(selectedOpening.opening));
      } else {
        params.delete('opening');
      }

      if (variationSearch && selectedOpening) {
        params.set('variation', encodeURIComponent(variationSearch));
      } else {
        params.delete('variation');
      }

      const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`;

      // Only update if URL actually changed to avoid unnecessary history entries
      if (newUrl !== window.location.pathname + window.location.search) {
        window.history.replaceState({}, '', newUrl);
      }
    };

    // Small delay to avoid updating URL during rapid changes
    const timeoutId = setTimeout(updateURL, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedOpening, variationSearch]);

  // Memoize selected variation data
  const openingData = useMemo(() =>
    selectedOpening?.variations.find(variation => variation.variation === variationSearch),
    [selectedOpening, variationSearch]
  );

  // Optimized search handlers
  const handleOpeningSearch = useCallback((value: string) => {
    setOpeningSearchInput(value);
    // Don't reset variation immediately - let the effect handle it
    // This prevents clearing variation when user is typing
  }, []);

  const handleVariationSearch = useCallback((value: string) => {
    setVariationSearch(value);
  }, []);

  // Memoize derived UI values for performance
  const uiData = useMemo(() => {
    const selectedVariation = openingData;
    const currentFen = selectedVariation?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    const movesContent = selectedVariation?.openingMoves.length ?
      selectedVariation.openingMoves.map((move: string, index: number) => (
        <span key={`${move}-${index}`} className="px-2 py-1 bg-white/20 rounded text-sm text-nowrap">
          {move}
        </span>
      )) :
      <span className="text-gray-400">{NO_MOVES_MSG}</span>;

    return {
      selectedVariation,
      currentFen,
      movesContent,
      evaluation: selectedVariation?.openingEval ?? 0
    };
  }, [openingData]);

  // Show loading state
  if (isLoading) {
    return (
      <MainContainer>
        <Title text={CONTENT.title} icon={<ReportIcon />} />
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-400 text-lg">Loading openings...</div>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Title text={CONTENT.title} icon={<ReportIcon />} />

      <div className="w-full h-full grid gap-5 grid-cols-1 lg:grid-cols-3 lg:gap-5">

        {/* -- Left Column: Controls, Moves, Board -- */}
        <div className="lg:col-span-1 flex flex-col justify-between items-center gap-2">

          {/* Controls */}
          <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="flex flex-row gap-3 w-full">
              <InputField
                placeholder="Search openings..."
                value={openingSearchInput}
                onAction={handleOpeningSearch}
              />
              <Dropdown
                options={variationOptions}
                value={variationSearch}
                onSelect={handleVariationSearch}
                disabled={variationOptions.length === 0}
              />
            </div>

          </div>

          {/* Moves */}
          <div className="w-full max-w-md flex flex-nowrap items-center gap-2 min-h-[2.5rem] overflow-y-hidden scrollbar-thin">
            {uiData.movesContent}
          </div>

          {/* Board and Eval Bar */}
          <div className="flex flex-row items-center justify-center w-fit mx-auto gap-2 max-w-full">
            <div className="h-[min(80vw,360px)] w-7 flex-shrink-0">
              <EvalBar evaluation={uiData.evaluation} />
            </div>
            <div className="aspect-square w-[min(80vw,360px)] rounded-lg overflow-hidden shadow-lg">
              <Chessboard
                options={{
                  position: uiData.currentFen,
                  arePiecesDraggable: false,
                  boardWidth: 360,
                  customBoardStyle: {
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                  }
                }}
              />
            </div>
          </div>

        </div>

        {/* -- Right Column: Info Display -- */}
        <div className="flex flex-col h-full w-full min-w-fit min-h-0 bg-white/10 rounded-lg shadow-md ring-1 ring-black/5 col-span-2">
          <InfoDisplay variation={uiData.selectedVariation} />
        </div>

      </div>
    </MainContainer>
  );
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Opening; 