"use client"

import { Chess } from 'chess.js';
import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';

interface ChessMinigameProps {
    initialFen?: string;
    timeLimit?: number;
}

const ChessMinigame: React.FC<ChessMinigameProps> = ({
    initialFen = "8/7N/8/3k4/8/2K5/5B2/8 w - - 0 1",
    timeLimit = 30
}) => {
    const [game, setGame] = useState(new Chess(initialFen));
    const [gamePosition, setGamePosition] = useState(initialFen);
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [isGameActive, setIsGameActive] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [gameResult, setGameResult] = useState<string>('');

    useEffect(() => {
        if (!isGameActive || !isGameStarted || timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsGameActive(false);
                    setGameResult('Time\'s up!');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isGameActive, isGameStarted, timeLeft]);

    useEffect(() => {
        if (game.isCheckmate()) {
            setIsGameActive(false);
            setGameResult('Checkmate! Well done!');
        }
    }, [game]);

    const makeMove = useCallback(({ sourceSquare, targetSquare }: { piece: any; sourceSquare: string; targetSquare: string | null }) => {
        if (!isGameActive || !isGameStarted || !targetSquare) {
            return false;
        }

        try {
            // Always promote to queen for simplicity
            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
            });

            if (move) {
                setGamePosition(game.fen());
                return true;
            }
        } catch {
            return false;
        }
        return false;
    }, [game, isGameActive]);

    const startGame = () => {
        setIsGameStarted(true);
        setIsGameActive(true);
        setGameResult('');
    };

    const resetGame = () => {
        const newGame = new Chess(initialFen);
        setGame(newGame);
        setGamePosition(initialFen);
        setTimeLeft(timeLimit);
        setIsGameActive(false);
        setIsGameStarted(false);
        setGameResult('');
    };

    const formatTime = (seconds: number) => {
        return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center gap-4 mb-2">
                <div className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                    Time: {formatTime(timeLeft)}
                </div>
                {!isGameStarted && !gameResult && (
                    <button
                        type="button"
                        onClick={startGame}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        Start
                    </button>
                )}
                <button
                    type="button"
                    onClick={resetGame}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    Reset
                </button>
            </div>

            {gameResult && (
                <div className={`text-lg font-bold ${gameResult.includes('Checkmate') ? 'text-green-400' : 'text-red-400'}`}>
                    {gameResult}
                </div>
            )}

            <div className="w-96 h-96">
                <Chessboard
                    options={{
                        position: gamePosition,
                        onPieceDrop: makeMove,
                        boardOrientation: "white"
                    }}
                />
            </div>

            <div className="text-sm text-gray-400 text-center max-w-md">
                <p>Find checkmate before time runs out!</p>
                <p className="mt-1">Position: {initialFen}</p>
            </div>
        </div>
    );
};

export default ChessMinigame;