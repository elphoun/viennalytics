"use client"

import { memo, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, Title } from "../_components";
import { useOpeningStats } from "./ExplorerClient";
import OpeningSearch from "./_controls/OpeningSearch";
import VariantDropdown from "./_controls/VariantDropdown";
import ExplorerGrid from "../_components/ui/ExplorerGrid";
import ChessboardPanel from "../_components/chessboard/ChessboardPanel";
import { ChessboardManager } from "../_components/chessboard/chessboard";

const Explorer = memo(() => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [openingSearch, setOpeningSearch] = useState<string>("");
    const [variationSearch, setVariationSearch] = useState<string>("");
    const [chessboardManager, setChessboardManager] = useState<ChessboardManager | null>(null);
    const [currentPosition, setCurrentPosition] = useState<string>("");
    const [moves, setMoves] = useState<any[]>([]);
    const [evaluation, setEvaluation] = useState<number>(50);
    const [positionStatus, setPositionStatus] = useState<'normal' | 'check' | 'checkmate' | 'stalemate'>('normal');

    const { data: openingStats = [], isLoading, error } = useOpeningStats();

    // Initialize from URL parameters
    useEffect(() => {
        if (openingStats.length > 0) {
            const urlOpening = searchParams.get('opening');
            const urlVariation = searchParams.get('variation');

            if (urlOpening && urlOpening !== openingSearch) {
                setOpeningSearch(urlOpening);
            }
            if (urlVariation && urlVariation !== variationSearch) {
                setVariationSearch(urlVariation);
            }
        }
    }, [openingStats, searchParams]);

    // Auto-select first variation when opening changes
    useEffect(() => {
        if (openingSearch && openingStats.length > 0) {
            const opening = openingStats.find(opening => opening.opening === openingSearch);
            const firstVariant = opening?.variations?.[0]?.variation;
            if (firstVariant && variationSearch !== firstVariant) {
                setVariationSearch(firstVariant);
            }
        }
    }, [openingSearch, openingStats, variationSearch]);

    // Update URL when selections change
    const updateURL = (opening: string, variation: string) => {
        const params = new URLSearchParams();
        if (opening) params.set('opening', opening);
        if (variation) params.set('variation', variation);

        const queryString = params.toString();
        const newURL = queryString ? `/explorer?${queryString}` : '/explorer';
        router.push(newURL, { scroll: false });
    };

    const handleOpeningChange = (newOpening: string) => {
        setOpeningSearch(newOpening);
        if (newOpening) {
            const opening = openingStats.find(opening => opening.opening === newOpening);
            const firstVariant = opening?.variations?.[0]?.variation || '';
            setVariationSearch(firstVariant);
            updateURL(newOpening, firstVariant);
        } else {
            setVariationSearch('');
            updateURL('', '');
        }
    };

    const handleVariationChange = (newVariation: string) => {
        setVariationSearch(newVariation);
        updateURL(openingSearch, newVariation);
    };

    const openingData = useMemo(() => {
        const opening = openingStats.find(opening => opening.opening === openingSearch)
        const openingCheck = opening?.variations;
        if (openingCheck) { return openingCheck.find(variant => variant.variation === variationSearch) };
        return null;
    }, [openingStats, openingSearch, variationSearch]);

    const initialPosition = useMemo(() =>
        openingData?.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        , [openingData?.fen]);

    useEffect(() => {
        const manager = new ChessboardManager(initialPosition);
        setChessboardManager(manager);
        setCurrentPosition(manager.getPosition());
        setMoves([]);
        setEvaluation(manager.getPositionEvaluation());
        setPositionStatus(manager.getPositionStatus());
    }, [initialPosition]);

    const handlePieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string }): boolean => {
        if (!chessboardManager) return false;

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


    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 p-3">
                <div>Loading openings…</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 p-3">
                <div>Error: {(error as Error).message}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center flex-1 p-3">
            <Title text="Opening Explorer" icon={<SearchIcon size={20} />} />

            <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 min-h-0 gap-4 p-2">
                <div className="flex flex-col gap-2 lg:col-span-1">
                    <div className="flex flex-row gap-2">
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
                    <ExplorerGrid>
                        <ChessboardPanel openingData={openingData}/>
                    </ExplorerGrid>
                </div>
                <ExplorerGrid>
                    <InfoDisplay />
                </ExplorerGrid>
            </div>
        </div>
    );
});

Explorer.displayName = "Explorer";

export default Explorer;