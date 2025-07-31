"""
Chess utility functions for data processing and analysis.

This module contains common utility functions used across multiple chess data processing modules.
It provides functionality for PGN processing, game result handling, player analysis, 
performance monitoring, and display utilities.

Key Functions:
- PGN Processing: extract_moves_from_pgn(), move_sequence_to_list(), clean_san_move()
- Game Analysis: map_game_result(), get_next_moves()
- Player Analysis: get_strongest_player(), has_digit(), create_player_dict()
- Performance: PerformanceMonitor class for system monitoring
- Display: print_horizontal() for formatted output

Usage:
    from chess_utils import extract_moves_from_pgn, PerformanceMonitor
    
    # Process PGN moves
    moves = extract_moves_from_pgn(pgn_string)
    
    # Monitor performance
    monitor = PerformanceMonitor()
    monitor.print_stats("Processing complete")

Dependencies:
- pandas: For data processing
- psutil: For system monitoring
- re: For regular expressions
- collections.Counter: For move counting
- chess: For chess board operations
"""

import re
import chess
import pandas as pd
import time
import psutil
from collections import Counter


def move_sequence_to_fen(move_sequence):
    """Convert a move sequence string to a full FEN string."""
    if not move_sequence or move_sequence.strip() == "":
        return None

    board = chess.Board()
    try:
        moves = move_sequence.split("|")
        for move in moves:
            move = move.strip()
            if move == "":
                continue
            board.push_san(move)
        return board.fen()
    except Exception:
        return None


def safe_get_eval(fen):
    """Safely get evaluation for a FEN position."""
    from stockfish_engine import get_stockfish_eval
    import pandas as pd
    
    if (
        pd.notna(fen)
        and fen
        and isinstance(fen, str)
        and len(fen.strip()) > 0
    ):
        if " " in fen and any(piece in fen for piece in "rnbqkpRNBQKP"):
            try:
                return get_stockfish_eval(fen)
            except Exception:
                return None
    return None

# --- PGN Processing Functions ---
def extract_moves_from_pgn(pgn_moves):
    """
    Extract only SAN moves from PGN format, removing annotations, evals, and clock tags.
    
    Args:
        pgn_moves (str): Raw PGN move string with annotations
        
    Returns:
        str: Clean move sequence separated by '|'
    """
    if pd.isna(pgn_moves):
        return ""
    # Remove all curly-brace blocks (annotations, evals, clocks, etc.)
    clean_moves = re.sub(r'\{[^}]*\}', '', pgn_moves)
    # Remove move numbers and dots
    clean_moves = re.sub(r'\d+\.', '', clean_moves)
    # Remove result tags (e.g., 1-0, 0-1, 1/2-1/2)
    clean_moves = re.sub(r'1-0|0-1|1/2-1/2', '', clean_moves)
    # Split by whitespace and filter out empty strings and ellipsis
    moves = [m for m in clean_moves.split() if m and m != '..']
    # Join with pipes
    return '|'.join(moves)

def move_sequence_to_list(move_sequence):
    """
    Convert pipe-separated move_sequence to a list of moves.
    
    Args:
        move_sequence (str): Move sequence separated by '|'
        
    Returns:
        list: List of individual moves
    """
    if not move_sequence:
        return []
    return [m for m in move_sequence.split('|') if m]

def clean_san_move(move):
    """
    Remove annotation symbols from the end of the move.
    
    Args:
        move (str): SAN move with possible annotations
        
    Returns:
        str: Clean SAN move without annotations
    """
    return re.sub(r'[!?+#=]+$', '', move)


# --- Game Result Processing ---
def map_game_result(result):
    """
    Map game result to standardized format.
    
    Args:
        result (str): Game result (1-0, 0-1, 1/2-1/2)
        
    Returns:
        str: Standardized result ('white', 'black', 'draw', or original)
    """
    if result == '1-0':
        return 'white'
    elif result == '0-1':
        return 'black'
    elif result == '1/2-1/2':
        return 'draw'
    else:
        return result


# --- Player Analysis Functions ---
def get_strongest_player(players):
    """
    Get strongest player from a list of (name, elo) tuples.
    
    Args:
        players (list): List of (name, elo) tuples
        
    Returns:
        str or None: Name of strongest player, or None if empty list
    """
    if not players:
        return None
    return max(players, key=lambda x: x[1])[0]

def has_digit(s):
    """
    Check if string contains any digits.
    
    Args:
        s (str): String to check
        
    Returns:
        bool: True if string contains digits, False otherwise
    """
    return any(char.isdigit() for char in s) if s else False

def create_player_dict(name, elo):
    """
    Create standardized player dictionary.
    
    Args:
        name (str): Player name
        elo (int): Player ELO rating
        
    Returns:
        dict: Player dictionary with name and elo
    """
    return {'name': name, 'elo': int(elo) if elo else 0}

def create_player(name, elo):
    """Create player dictionary (alias for create_player_dict)."""
    return create_player_dict(name, elo)


# --- Move Analysis Functions ---
def get_next_moves(games, opening_moves):
    """Get popular next moves after opening sequence."""
    if not opening_moves:
        return []
    
    next_moves = []
    opening_length = len(opening_moves)
    
    for _, game in games.iterrows():
        moves_data = game.get('moves')
        if moves_data is None or (isinstance(moves_data, float) and pd.isna(moves_data)):
            continue
            
        if isinstance(moves_data, list):
            moves = moves_data
        elif isinstance(moves_data, str):
            moves = moves_data.split('|') if '|' in moves_data else [moves_data]
        else:
            continue
            
        if len(moves) > opening_length:
            next_move = moves[opening_length]
            if next_move and next_move.strip():
                next_moves.append(next_move.strip())
    
    # Count occurrences and return top moves
    move_counts = Counter(next_moves)
    return [{'move': move, 'count': count} for move, count in move_counts.most_common(10)]


# --- Performance Monitoring ---
class PerformanceMonitor:
    """
    Monitor system performance during processing.
    
    Tracks elapsed time, memory usage, and CPU utilization.
    """
    
    def __init__(self):
        """Initialize performance monitor."""
        self.start_time = time.time()
        self.last_checkpoint = self.start_time
        try:
            self.process = psutil.Process()
        except ImportError:
            self.process = None
    
    def checkpoint(self, name):
        """Print checkpoint timing information."""
        current_time = time.time()
        elapsed = current_time - self.last_checkpoint
        total_elapsed = current_time - self.start_time
        print(f"{name}: {elapsed:.2f}s (Total: {total_elapsed:.2f}s)")
        self.last_checkpoint = current_time
    
    def get_stats(self):
        """
        Get current performance statistics.
        
        Returns:
            dict: Dictionary with elapsed_seconds, memory_mb, cpu_percent
        """
        elapsed = time.time() - self.start_time
        if self.process:
            memory_mb = self.process.memory_info().rss / 1024 / 1024
            cpu_percent = self.process.cpu_percent()
        else:
            memory_mb = 0
            cpu_percent = 0
        return {
            'elapsed_seconds': elapsed,
            'memory_mb': memory_mb,
            'cpu_percent': cpu_percent
        }
    
    def print_stats(self, stage=""):
        """
        Print current performance statistics.
        
        Args:
            stage (str): Optional stage description for output
        """
        if self.process:
            stats = self.get_stats()
            print(f"[{stage}] Time: {stats['elapsed_seconds']:.1f}s, "
                  f"Memory: {stats['memory_mb']:.1f}MB, "
                  f"CPU: {stats['cpu_percent']:.1f}%")
        else:
            total_elapsed = time.time() - self.start_time
            print(f"{stage}: Total time: {total_elapsed:.2f}s")


# --- Display Utilities ---
def print_horizontal():
    """Print a horizontal separator in the terminal."""
    print("=" * 60)

def is_valid_chess_move(move):
    """Check if a move is a valid chess move in algebraic notation."""
    if not move or not isinstance(move, str):
        return False
    
    # Remove common annotations and spaces
    clean_move = move.strip().rstrip('!?+#=')
    
    # Filter out obvious non-moves
    invalid_patterns = [
        r'^\d+\.+.*$',  # Move numbers like "7..." or "7.e4"
        r'^\.+$',       # Just dots
        r'^\d+$',       # Just numbers
        r'^$',          # Empty string
    ]
    
    for pattern in invalid_patterns:
        if re.match(pattern, clean_move):
            return False
    
    # Comprehensive patterns for chess moves in algebraic notation
    valid_patterns = [
        # Castling
        r'^O-O(-O)?$',
        r'^0-0(-0)?$',  # Alternative castling notation
        
        # Piece moves (with optional disambiguation and capture)
        r'^[KQRBN][a-h]?[1-8]?x?[a-h][1-8]$',
        
        # Pawn moves (including captures and promotions)
        r'^[a-h][1-8]$',                    # Simple pawn move
        r'^[a-h]x[a-h][1-8]$',             # Pawn capture
        r'^[a-h][18]=[QRBN]$',              # Pawn promotion
        r'^[a-h]x[a-h][18]=[QRBN]$',       # Pawn capture with promotion
        
        # En passant (rare but valid)
        r'^[a-h]x[a-h][36](\s+e\.p\.)?$',
    ]
    
    for pattern in valid_patterns:
        if re.match(pattern, clean_move):
            return True
    
    return False
