"use client";

import {
  memo,
  useMemo,
  useState,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, Title } from "../_components";
import { useOpeningStats } from "./ExplorerClient";
import OpeningSearch from "./_controls/OpeningSearch";
import VariantDropdown from "./_controls/VariantDropdown";
import ExplorerGrid from "../_components/ui/ExplorerGrid";
import ChessboardPanel from "../_components/chessboard/ChessboardPanel";
import InfoDisplay from "./[openings]/InfoDisplay";
import GameCard from "./[openings]/GameCard";


// Loading component for better UX
const ExplorerLoading = () => (
  <div className="flex flex-col items-center justify-center flex-1 p-3">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
      <div>Loading openings…</div>
    </div>
  </div>
);

const ExplorerContent = memo(() => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [openingSearch, setOpeningSearch] = useState<string>("");
  const [variationSearch, setVariationSearch] = useState<string>("");

  const { data: openingStats = [], isLoading, error } = useOpeningStats();

  // Initialize from URL parameters with useCallback for better performance
  const initializeFromURL = useCallback(() => {
    if (openingStats.length > 0) {
      const urlOpening = searchParams.get("opening");
      const urlVariation = searchParams.get("variation");

      if (urlOpening && urlOpening !== openingSearch) {
        setOpeningSearch(urlOpening);
      }
      if (urlVariation && urlVariation !== variationSearch) {
        setVariationSearch(urlVariation);
      }
    }
  }, [openingStats, searchParams, openingSearch, variationSearch]);

  useEffect(() => {
    initializeFromURL();
  }, [initializeFromURL]);

  // Auto-select first variation when opening changes
  useEffect(() => {
    if (openingSearch && openingStats.length > 0) {
      const opening = openingStats.find(
        (opening) => opening.opening === openingSearch
      );
      const firstVariant = opening?.variations?.[0]?.variation;
      if (firstVariant && variationSearch !== firstVariant) {
        setVariationSearch(firstVariant);
      }
    }
  }, [openingSearch]);

  // Update URL when selections change with useCallback
  const updateURL = useCallback(
    (opening: string, variation: string) => {
      const params = new URLSearchParams();
      if (opening) params.set("opening", opening);
      if (variation) params.set("variation", variation);

      const queryString = params.toString();
      const newURL = queryString ? `/explorer?${queryString}` : "/explorer";
      router.push(newURL, { scroll: false });
    },
    [router]
  );

  const handleOpeningChange = useCallback(
    (newOpening: string) => {
      setOpeningSearch(newOpening);
      if (newOpening) {
        const opening = openingStats.find(
          (opening) => opening.opening === newOpening
        );
        const firstVariant = opening?.variations?.[0]?.variation || "";
        setVariationSearch(firstVariant);
        updateURL(newOpening, firstVariant);
      } else {
        setVariationSearch("");
        updateURL("", "");
      }
    },
    [openingStats, updateURL]
  );

  const handleVariationChange = useCallback(
    (newVariation: string) => {
      setVariationSearch(newVariation);
      updateURL(openingSearch, newVariation);
    },
    [openingSearch, updateURL]
  );

  const openingData = useMemo(() => {
    const opening = openingStats.find(
      (opening) => opening.opening === openingSearch
    );
    const openingCheck = opening?.variations;
    if (openingCheck) {
      return openingCheck.find(
        (variant) => variant.variation === variationSearch
      );
    }
    return null;
  }, [openingStats, openingSearch, variationSearch]);

  const gameCards = useMemo(() => {
    const hasTopGames = Boolean(openingData?.topGames?.length);
    if (!hasTopGames || !openingData?.topGames) {
      return (
        <div
          className="text-center text-slate-400 py-8"
          role="status"
          aria-live="polite"
        >
          No games available for this variation
        </div>
      );
    }

    // sanitize nested objects so GameCard never receives raw objects that React would try to render directly
    const sanitizeValue = (v: any): any => {
      if (v === null || v === undefined) return v;
      if (
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean"
      )
        return v;
      if (Array.isArray(v)) return v.map(sanitizeValue);
      if (typeof v === "object") {
        if ("name" in v && typeof v.name === "string") return v.name;
        if ("title" in v && typeof v.title === "string") return v.title;
        try {
          return JSON.stringify(v);
        } catch {
          return String(v);
        }
      }
      return String(v);
    };

    const sanitizeGame = (game: any) => {
      if (!game || typeof game !== "object") return game;
      const out: Record<string, any> = {};
      Object.keys(game).forEach((k) => {
        out[k] = sanitizeValue(game[k]);
      });
      return out;
    };

    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 w-full gap-4"
        role="list"
        aria-label="Top games for this opening variation"
      >
        {openingData.topGames.slice(0, 20).map((game) => {
          const safe = sanitizeGame(game);
          const key = String(
            safe.gameURL ?? safe.id ?? JSON.stringify(safe).slice(0, 64)
          );
          return (
            <div key={key} role="listitem">
              <GameCard game={safe} />
            </div>
          );
        })}
      </div>
    );
  }, [openingData]);

  if (isLoading) {
    return <ExplorerLoading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-3">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-400 mb-2">
            Error loading openings
          </div>
          <div className="text-sm text-slate-400">
            {(error as Error).message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center w-full flex-1 p-3"
      role="main"
      aria-label="Opening Explorer"
    >
      <Title text="Opening Explorer" icon={<SearchIcon size={20} />} />

      <div className="h-full w-full grid grid-cols-1 lg:grid-cols-[570px_1fr] grid-rows-1 gap-6 p-2 min-h-0">
        <ExplorerGrid>
          <div className="flex flex-row gap-3 mb-4">
            <OpeningSearch
              setOpeningSearch={handleOpeningChange}
              data={openingStats}
              value={openingSearch}
            />
            <VariantDropdown
              data={openingStats}
              openingSearch={openingSearch}
              value={variationSearch}
              setValue={handleVariationChange}
              disabled={openingSearch === ""}
            />
          </div>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                Loading chessboard...
              </div>
            }
          >
            <ChessboardPanel openingData={openingData} />
          </Suspense>
        </ExplorerGrid>
        <ExplorerGrid>
          <InfoDisplay variation={openingData} />
        </ExplorerGrid>
      </div>

      <ExplorerGrid>{gameCards}</ExplorerGrid>
    </div>
  );
});

ExplorerContent.displayName = "ExplorerContent";

const Explorer = memo(() => (
  <Suspense fallback={<ExplorerLoading />}>
    <ExplorerContent />
  </Suspense>
));

Explorer.displayName = "Explorer";

export default Explorer;
