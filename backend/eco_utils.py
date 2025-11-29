"""
ECO (Encyclopedia of Chess Openings) processor for chess opening analysis.

This module handles loading, processing, and matching chess openings using ECO data.
It provides efficient lookup structures and caching for opening identification from move sequences.

Key Features:
- Load ECO data from JSON files
- Create optimized lookup structures for fast opening matching
- Cache frequently accessed opening data
- Split opening names into main opening and variation
- Batch processing for multiple opening lookups

Main Functions:
- load_eco_data(): Load ECO data from JSON files
- get_opening(): Match move sequence to opening name
- split_opening_name(): Split opening into main name and variation
- batch_get_openings(): Process multiple openings efficiently

Usage:
    from eco_utils import get_opening, split_opening_name, eco_openings
    
    # Get opening from move sequence
    opening = get_opening("e4|e5|Nf3|Nc6", eco_openings)
    
    # Split opening name
    main, variation = split_opening_name("Sicilian Defense: Najdorf Variation")

Data Requirements:
- ECO JSON files in data/eco/ directory
- Files should contain opening names and move sequences

Performance:
- Uses LRU caching for frequently accessed openings
- Optimized lookup structures for fast matching
- Early termination for perfect matches
"""

import json 
import glob
import re
import pandas as pd
import chess
from functools import lru_cache
from collections import defaultdict
from logging_config import setup_logging, log_file_operation, log_data_processing

# --- Performance Configuration ---
CACHE_SIZE = 5000  # Cache size for move sequence lookups

# Set up logging
logger = setup_logging(level="INFO", module_name="eco_utils")

# --- ECO Data Loading and Processing ---
def load_eco_data():
    """
    Load ECO data from JSON files in the data/eco/ directory.

    Returns:
        dict: A dictionary containing ECO data loaded from all matching JSON files.

    Raises:
        FileNotFoundError: If no ECO files are found in the data/eco/ directory.
    """
    import os
    eco_data = {}
    
    # Try multiple possible paths for ECO data
    possible_paths = [
        "data/eco/eco*.json",  # Relative to current directory
        "../data/eco/eco*.json",  # One level up
        "backend/data/eco/eco*.json",  # From project root
        os.path.join(os.path.dirname(__file__), "../data/eco/eco*.json")  # Relative to this file
    ]
    
    eco_files = []
    for path_pattern in possible_paths:
        eco_files = glob.glob(path_pattern)
        if eco_files:
            logger.info(f"Found ECO files at: {path_pattern}")
            break
    
    if not eco_files:
        logger.warning("No ECO files found in any of the expected locations:")
        for path in possible_paths:
            logger.warning(f"  - {path}")
        logger.warning("Opening classification will be limited. Create data/eco/ directory with ECO JSON files for full functionality.")
        return {}  # Return empty dict instead of raising error

    log_data_processing(logger, "Loading ECO files", len(eco_files))
    for eco_file in eco_files:
        try:
            with open(eco_file) as f:
                eco_data.update(json.load(f))
            log_file_operation(logger, "Loaded ECO file", eco_file)
        except Exception as e:
            logger.error(f"Error loading {eco_file}: {e}")
    
    return eco_data

def create_eco_lookup(eco_data):
    """
    Create efficient lookup structures for ECO openings.

    Args:
        eco_data (dict): The ECO data loaded from JSON files.

    Returns:
        tuple: A tuple containing:
            - eco_openings (list): List of tuples (opening name, move list).
            - eco_lookup (dict): Dictionary for fast opening name matching.
            - move_tree (dict): Tree structure for faster move sequence matching.
            - eco_code_lookup (dict): Dictionary for ECO code lookup.
    """
    eco_openings = []
    eco_lookup = {}  # For faster opening name matching
    move_tree = defaultdict(list)  # Tree structure for move sequences
    eco_code_lookup = {}  # New: lookup by ECO code
    
    for entry in eco_data.values():
        if "moves" in entry and "name" in entry:
            moves_text = entry["moves"]
            moves = re.findall(r'\d+\.\s*([^\s]+)\s*([^\s]+)?', moves_text)
            flat_moves = []
            for pair in moves:
                flat_moves.extend([m for m in pair if m])
            
            if flat_moves:
                eco_openings.append((entry["name"], flat_moves))
                
                # Create lookup entries for faster matching
                eco_lookup[entry["name"].lower()] = flat_moves
                
                # Also add partial matches for better coverage
                for word in entry["name"].lower().split():
                    eco_lookup.setdefault(word, flat_moves)
                
                # Build move tree for faster sequence matching
                if flat_moves:
                    move_tree[tuple(flat_moves[:3])].append((entry["name"], flat_moves))
                
                # Add ECO code lookup
                if "eco" in entry:
                    eco_code = entry["eco"]
                    if eco_code not in eco_code_lookup:
                        eco_code_lookup[eco_code] = []
                    eco_code_lookup[eco_code].append((entry["name"], flat_moves))
    
    return eco_openings, eco_lookup, move_tree, eco_code_lookup

@lru_cache(maxsize=CACHE_SIZE)
def cached_get_opening(moves: str) -> str:
    """
    Cached version of get_opening for repeated move sequences.
    
    Args:
        moves (str): The move sequence, with moves separated by '|'.
    
    Returns:
        str: The best matching opening name, or 'Unknown Opening' if no match is found.
    """
    return get_opening_uncached(moves, eco_openings)

def get_opening_uncached(moves: str, eco_openings) -> str:
    """
    Takes a move sequence in the format <move>|<move>|....|<move> and returns the best matching opening name.

    Args:
        moves (str): The move sequence, with moves separated by '|'.
        eco_openings (list): List of tuples (opening name, move list).

    Returns:
        str: The best matching opening name, or 'Unknown Opening' if no match is found.
    """
    if moves == "" or pd.isna(moves): 
        return "Unknown Opening"
    
    move_list = moves.split('|')
    if not move_list: 
        return "Unknown Opening"
    
    # Clean move list
    move_list = [move.strip() for move in move_list if move.strip()]
    
    best_match = ("Unknown Opening", 0)
    
    # Use optimized matching with early termination
    for name, eco_moves in eco_openings:
        if len(move_list) >= len(eco_moves):
            # Check if moves match up to the length of eco_moves
            if move_list[:len(eco_moves)] == eco_moves:
                if len(eco_moves) > best_match[1]:
                    best_match = (name, len(eco_moves))
                    # Early termination if we find a perfect match
                    if len(eco_moves) == len(move_list):
                        break
    
    return best_match[0]

def get_opening(moves: str, eco_openings) -> str:
    """
    Takes a move sequence in the format <move>|<move>|....|<move> and returns the best matching opening name.

    Args:
        moves (str): The move sequence, with moves separated by '|'.
        eco_openings (list): List of tuples (opening name, move list).

    Returns:
        str: The best matching opening name, or 'Unknown Opening' if no match is found.
    """
    return cached_get_opening(moves)

# --- Utility Functions ---
@lru_cache(maxsize=1000)
def cached_split_opening_name(opening_name: str) -> tuple:
    """
    Cached version of split_opening_name for repeated opening names.
    
    Args:
        opening_name (str): The full opening name, possibly with variation.

    Returns:
        tuple: (main_opening (str), variation_name (str)). If no variation, variation_name is an empty string.
    """
    return split_opening_name_uncached(opening_name)

def split_opening_name_uncached(opening_name: str) -> tuple:
    """
    Split opening name into main opening and variation.

    Args:
        opening_name (str): The full opening name, possibly with variation.

    Returns:
        tuple: (main_opening (str), variation_name (str)). If no variation, variation_name is an empty string.
    """
    if ':' in opening_name:
        parts = opening_name.split(':', 1)
        main_opening = parts[0].strip()
        variation_part = parts[1].strip()
        if ',' in variation_part:
            variation_name = variation_part.split(',')[0].strip()
            return main_opening, variation_name
        else:
            return main_opening, variation_part
    elif ',' in opening_name:
        parts = opening_name.split(',', 1)
        return parts[0].strip(), parts[1].strip()
    else:
        return opening_name, ''

def split_opening_name(opening_name: str) -> tuple:
    """
    Split opening name into main opening and variation (with caching).

    Args:
        opening_name (str): The full opening name, possibly with variation.

    Returns:
        tuple: (main_opening (str), variation_name (str)). If no variation, variation_name is an empty string.
    """
    return cached_split_opening_name(opening_name)

# --- Batch Processing Functions ---
def batch_get_openings(move_sequences: list, eco_openings: list) -> list:
    """
    Get openings for multiple move sequences efficiently.
    
    Args:
        move_sequences (list): List of move sequence strings.
        eco_openings (list): List of tuples (opening name, move list).
    
    Returns:
        list: List of opening names corresponding to the input move sequences.
    """
    return [get_opening(seq, eco_openings) for seq in move_sequences]

def batch_split_opening_names(opening_names: list) -> list:
    """
    Split multiple opening names efficiently.
    
    Args:
        opening_names (list): List of opening name strings.
    
    Returns:
        list: List of tuples (main_opening, variation_name) corresponding to the input opening names.
    """
    return [split_opening_name(name) for name in opening_names]

def get_position_after_opening_by_eco(eco_code, eco_code_lookup):
    """Get FEN position after opening moves using ECO code lookup."""
    if not eco_code or not eco_code_lookup or eco_code not in eco_code_lookup:
        return None

    # Get the first (usually most common) opening for this ECO code
    openings_for_eco = eco_code_lookup[eco_code]
    if not openings_for_eco:
        return None

    opening_name, opening_moves = openings_for_eco[0]  # Take first one

    # Play the opening moves on a board
    try:
        board = chess.Board()
        if isinstance(opening_moves, str):
            return None

        for move in opening_moves:
            move = move.strip()
            if move == "":
                continue
            board.push_san(move)

        return board.fen()
    except Exception:
        return None

def get_position_after_opening(
    move_sequence,
    opening_name,
    variation_name,
    eco_lookup,
    eco_code=None,
    eco_code_lookup=None,
):
    """Get the position after the specific opening variation has been played.
    Now supports ECO code lookup for better accuracy."""

    # Try ECO code lookup first if available
    if eco_code and eco_code_lookup:
        fen = get_position_after_opening_by_eco(eco_code, eco_code_lookup)
        if fen:
            return fen

    # Fallback to name-based lookup
    if not move_sequence or not opening_name:
        return None

    board = chess.Board()
    try:
        full_opening = (
            f"{opening_name}: {variation_name}" if variation_name else opening_name
        )
        opening_moves = eco_lookup.get(full_opening.lower())
        if not opening_moves:
            opening_moves = eco_lookup.get(opening_name.lower())
        if not opening_moves:
            return None

        for move in opening_moves:
            move = move.strip()
            if move == "":
                continue
            board.push_san(move)

        result_fen = board.fen()
        return result_fen
    except Exception:
        return None
    
def find_eco_name_and_moves(opening: str, variation: str):
    """Helper to find canonical ECO name and moves for a given (opening, variation).

    Args:
        opening (str): Opening Name
        variation (str): Variant Name

    Returns:
        (str, list[str]): The canonical opening name and moves
    """
    candidates = []
    if variation:
        search_name = f"{opening}: {variation}".lower()
    else:
        search_name = opening.lower()
        
    for name, moves in eco_openings:
        if name.lower() == search_name:
            return name, moves
        if search_name in name.lower():
            candidates.append((name, moves))
    if candidates:
        return candidates[0]
    return f"{opening}{(': ' + variation) if variation else ''}", []

def get_proper_opening_info(opening, variation, move_list):
    """Get proper opening name, ECO code, and moves from game data."""
    # First try to find ECO match using the opening and variation names
    full_name, opening_moves = find_eco_name_and_moves(opening, variation)
    
    # If no moves found, try using the actual move sequence from games
    if not opening_moves and move_list:
        # Use the first few moves to try to identify the opening
        move_sequence = '|'.join(move_list[:10])  # Use first 10 moves
        eco_opening_name = get_opening(move_sequence, eco_openings)
        if eco_opening_name != "Unknown Opening":
            full_name = eco_opening_name
            # Find the moves for this opening
            for name, moves in eco_openings:
                if name == eco_opening_name:
                    opening_moves = moves
                    break
    
    # Extract base opening name (everything before the first colon)
    base_opening = full_name.split(':')[0].strip() if ':' in full_name else full_name
    
    # Extract variation name (everything after the first colon)
    variation_name = full_name.split(':', 1)[1].strip() if ':' in full_name else variation
    
    return base_opening, variation_name, opening_moves

# --- Initialize ECO Data ---
logger.info("Loading ECO data...")
eco_data = load_eco_data()
eco_openings, eco_lookup, move_tree, eco_code_lookup = create_eco_lookup(eco_data)
log_data_processing(logger, "Loaded openings", len(eco_openings))
logger.info(f"Created {len(move_tree)} move tree entries")