"""
Stockfish chess engine integration for position evaluation and analysis.

This module provides a thread-safe interface to Stockfish chess engine for evaluating positions,
converting move sequences to FEN notation, and batch processing multiple positions.

Key Features:
- Thread-safe Stockfish engine pool for parallel processing
- LRU caching for frequently evaluated positions
- Move sequence to FEN conversion
- Opening position analysis
- Batch processing for multiple evaluations

Main Classes:
- StockfishPool: Thread-safe pool of Stockfish engines

Main Functions:
- get_stockfish_eval(): Get evaluation for a FEN position
- move_sequence_to_fen(): Convert move sequence to FEN
- get_position_after_opening(): Get position after opening moves
- batch_get_stockfish_evals(): Evaluate multiple positions in parallel

Usage:
    from stockfish_engine import get_stockfish_eval, move_sequence_to_fen
    
    # Convert moves to FEN
    fen = move_sequence_to_fen("e4|e5|Nf3|Nc6")
    
    # Get evaluation
    eval_score = get_stockfish_eval(fen)
    
    # Batch processing
    evaluations = batch_get_stockfish_evals(fen_list)

Requirements:
- Stockfish binary installed and configured in config.py
- python-chess library for board representation
- stockfish library for engine communication

Performance:
- Engine pool prevents repeated initialization overhead
- LRU caching reduces redundant evaluations
- Parallel processing for batch operations
- Automatic cleanup of engine resources
"""

import os
from stockfish import Stockfish
import chess
from functools import lru_cache
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from config import STOCKFISH_PATH, MAX_WORKERS

# --- Constants ---
CACHE_SIZE = 10000  # Increase cache size for better hit rates

# --- Stockfish Engine Pool ---
class StockfishPool:
    """Thread-safe pool of Stockfish engines for parallel processing."""
    
    def __init__(self, engine_path, pool_size=4, depth=20):
        self.engine_path = engine_path
        self.pool_size = pool_size
        self.depth = depth
        self.engines = []
        self.lock = threading.Lock()
        self._initialize_pool()
    
    def _initialize_pool(self):
        """Initialize the engine pool."""
        for _ in range(self.pool_size):
            try:
                engine = Stockfish(path=self.engine_path, depth=self.depth)
                self.engines.append(engine)
            except Exception as e:
                print(f"Warning: Could not initialize Stockfish engine: {e}")
    
    def get_engine(self):
        """Get an available engine from the pool."""
        with self.lock:
            if self.engines:
                return self.engines.pop()
            else:
                # Create a new engine if pool is empty
                return Stockfish(path=self.engine_path, depth=self.depth)
    
    def return_engine(self, engine):
        """Return an engine to the pool."""
        with self.lock:
            if len(self.engines) < self.pool_size:
                self.engines.append(engine)
    
    def cleanup(self):
        """Clean up all engines."""
        with self.lock:
            self.engines.clear()

# Initialize the engine pool
STOCKFISH_AVAILABLE = os.path.isfile(STOCKFISH_PATH)
if not STOCKFISH_AVAILABLE:
    print(f"Warning: Stockfish binary not found at {STOCKFISH_PATH}")
    print("Opening evaluations will be disabled. Install Stockfish to enable evaluations.")
    engine_pool = None
else:
    engine_pool = StockfishPool(STOCKFISH_PATH, pool_size=MAX_WORKERS, depth=20)

# --- Caching and Optimization ---
@lru_cache(maxsize=CACHE_SIZE)
def cached_move_sequence_to_fen(move_sequence):
    """Cached version of move_sequence_to_fen for repeated move sequences."""
    return move_sequence_to_fen_uncached(move_sequence)

def move_sequence_to_fen_uncached(move_sequence):
    """
    Convert a move sequence string to a full FEN string.

    Args:
        move_sequence (str): A string of moves separated by '|', in SAN notation.

    Returns:
        str | None: The full FEN string after applying the moves, or None if conversion fails.
    """
    if not move_sequence or move_sequence.strip() == '':
        return None
    
    board = chess.Board()
    try:
        moves = move_sequence.split('|')
        for move in moves:
            move = move.strip()
            if move == '':
                continue
            board.push_san(move)
        return board.fen()
    except Exception:
        return None

def move_sequence_to_fen(move_sequence):
    """
    Convert a move sequence string to a full FEN string (with caching).

    Args:
        move_sequence (str): A string of moves separated by '|', in SAN notation.

    Returns:
        str | None: The full FEN string after applying the moves, or None if conversion fails.
    """
    return cached_move_sequence_to_fen(move_sequence)

@lru_cache(maxsize=CACHE_SIZE)
def cached_get_stockfish_eval(fen):
    """Cached version of get_stockfish_eval for repeated positions."""
    return get_stockfish_eval_uncached(fen)

def get_stockfish_eval_uncached(fen):
    """
    Get Stockfish evaluation for a given FEN string.

    Args:
        fen (str): The FEN string representing the chess position.

    Returns:
        int | str | None: The evaluation in centipawns (int) if type is 'cp',
            a string in the format '# <moves>' if type is 'mate', or None if evaluation fails or type is unknown.
    """
    if not fen: 
        return None
    
    if not STOCKFISH_AVAILABLE or engine_pool is None:
        return None
    
    engine = None
    try:
        engine = engine_pool.get_engine()
        engine.set_fen_position(fen)
        eval_info = engine.get_evaluation()
        
        if eval_info['type'] == 'cp':
            return eval_info['value']
        elif eval_info['type'] == 'mate':
            return f"# {eval_info['value']}"
        else:
            return None
    except Exception:
        return None
    finally:
        if engine:
            engine_pool.return_engine(engine)

def get_stockfish_eval(fen):
    """
    Get Stockfish evaluation for a given FEN string (with caching).

    Args:
        fen (str): The FEN string representing the chess position.

    Returns:
        int | str | None: The evaluation in centipawns (int) if type is 'cp',
            a string in the format '# <moves>' if type is 'mate', or None if evaluation fails or type is unknown.
    """
    return cached_get_stockfish_eval(fen)

def get_top_stockfish_moves(fen, num_moves=5):
    """
    Get top engine moves for a given FEN position.

    Args:
        fen (str): The FEN string representing the chess position.
        num_moves (int): Number of top moves to return (default: 5).

    Returns:
        list: List of dictionaries with 'move', 'fen', and 'eval' keys, or empty list if evaluation fails.
    """
    if not fen or not STOCKFISH_AVAILABLE or engine_pool is None:
        return []
    
    engine = None
    try:
        engine = engine_pool.get_engine()
        engine.set_fen_position(fen)
        
        # Get top moves from Stockfish
        top_moves = engine.get_top_moves(num_moves)
        
        if not top_moves:
            return []
        
        result_moves = []
        board = chess.Board(fen)
        
        for move_info in top_moves:
            move_san = move_info['Move']
            centipawn = move_info['Centipawn']
            mate = move_info.get('Mate')
            
            # Create a copy of the board and make the move
            temp_board = board.copy()
            try:
                temp_board.push_san(move_san)
                resulting_fen = temp_board.fen()
                
                # Format evaluation
                if mate is not None:
                    eval_value = f"# {mate}"
                else:
                    eval_value = centipawn
                
                result_moves.append({
                    'move': move_san,
                    'fen': resulting_fen,
                    'eval': eval_value
                })
            except Exception:
                # Skip invalid moves
                continue
        
        return result_moves
        
    except Exception:
        return []
    finally:
        if engine:
            engine_pool.return_engine(engine)

def get_position_after_opening(move_sequence, opening_name, variation_name, eco_lookup):
    """
    Get the position after the specific opening variation has been played.

    Args:
        move_sequence (str): The move sequence from the game, separated by '|', in SAN notation.
        opening_name (str): The name of the opening.
        variation_name (str): The name of the variation (can be empty).
        eco_lookup (dict): A dictionary mapping opening names to their move lists.

    Returns:
        str | None: The FEN piece placement string (first field of FEN) after the opening, or None if not found or error occurs.
    """
    if not move_sequence or not opening_name:
        return None
    
    board = chess.Board()
    try:
        full_opening = f"{opening_name}: {variation_name}" if variation_name else opening_name
        opening_moves = eco_lookup.get(full_opening.lower())
        if not opening_moves:
            opening_moves = eco_lookup.get(opening_name.lower())
        if not opening_moves:
            return None
        
        for move in opening_moves:
            move = move.strip()
            if move == '':
                continue
            board.push_san(move)
        
        result_fen = board.fen().split(' ')[0]
        return result_fen
    except Exception:
        return None

# --- Batch Processing Functions ---
def batch_get_stockfish_evals(fen_list, max_workers=None):
    """
    Get Stockfish evaluations for multiple FEN positions in parallel.
    
    Args:
        fen_list (list): List of FEN strings to evaluate.
        max_workers (int): Number of worker threads (defaults to MAX_WORKERS).
    
    Returns:
        list: List of evaluations corresponding to the input FEN positions.
    """
    if not fen_list:
        return []
    
    max_workers = max_workers or MAX_WORKERS
    results = [None] * len(fen_list)
    
    def evaluate_fen(args):
        idx, fen = args
        return idx, get_stockfish_eval(fen)
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_idx = {executor.submit(evaluate_fen, (idx, fen)): idx 
                        for idx, fen in enumerate(fen_list) if fen}
        
        for future in as_completed(future_to_idx):
            try:
                idx, result = future.result()
                results[idx] = result
            except Exception as e:
                print(f"Error evaluating FEN: {e}")
    
    return results

def batch_move_sequences_to_fen(move_sequences):
    """
    Convert multiple move sequences to FEN positions efficiently.
    
    Args:
        move_sequences (list): List of move sequence strings.
    
    Returns:
        list: List of FEN positions corresponding to the input move sequences.
    """
    return [move_sequence_to_fen(seq) for seq in move_sequences]

# --- Cleanup Function ---
def cleanup_stockfish():
    """
    Clean up Stockfish engine pool when done.
    """
    global engine_pool
    if engine_pool:
        engine_pool.cleanup()
        engine_pool = None