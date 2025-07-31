"""
Configuration File

This module contains configuration settings for all components of the chess analysis pipeline,
including Stockfish engine paths, processing parameters, and other settings.
"""

# --- Imports --- 
import os
import platform

# --- Stockfish Configuration ---
def get_stockfish_path():
    """Get the appropriate Stockfish path based on the operating system."""
    system = platform.system().lower()
    
    # Common Stockfish paths
    if system == "windows":
        # Check common Windows locations
        possible_paths = [
            "stockfish-windows-x86-64-avx2/stockfish/stockfish-windows-x86-64-avx2.exe",
            "stockfish.exe",
            "C:\\Program Files\\Stockfish\\stockfish.exe",
            "C:\\Program Files (x86)\\Stockfish\\stockfish.exe",
            os.path.join(os.path.expanduser("~"), "stockfish", "stockfish.exe"),
        ]
    elif system == "darwin":  # macOS
        possible_paths = [
            "stockfish",
            "/usr/local/bin/stockfish",
            "/opt/homebrew/bin/stockfish",
            "/usr/bin/stockfish",
        ]
    else:  # Linux and others
        possible_paths = [
            "stockfish",
            "/usr/local/bin/stockfish",
            "/usr/bin/stockfish",
            "/opt/stockfish/stockfish",
        ]
    
    # Check if any of the possible paths exist
    for path in possible_paths:
        if os.path.isfile(path):
            return path
    
    # If not found, return the default name (user will need to install)
    return "stockfish"

# Stockfish engine path and other data
STOCKFISH_PATH = get_stockfish_path()
MAX_WORKERS = 12
STOCKFISH_DEPTH = 10
CACHE_SIZE = 10000

# Data Output Directory 
DATA_DIR = "data/generated_data"

# PGN_DIR
PGN_DIR = "data/pgn"

# ECO_DIR
ECO_DIR = "data/eco"

# Chunk Size. Used to save memory with large files
CHUNK_SIZE = 1000


# --- File Specific Information

## --- For `convert_pgn_csv.py`` --- 

### The name of the file that is outputted
CONVERT_PGN_CSV_OUT = "data/csvs/all_games_info.csv"

### Headers to Extract. These should match the content in the PGN exactly.
HEADERS = [
    "White",
    "Black",
    "WhiteElo",
    "BlackElo",
    "Result",
    "Opening",
    "Variant",
    "ECO",
    "Moves",
    "Event",
    "StudyName",
    "GameURL",
]  

## --- For `process_games.py` --- 

### The name of the file that is outputted
PROCESS_GAMES_OUT = "data/generated_data/processed_all_games.json"

### The minimum number of moves in a valid game
MIN_MOVE_COUNT = 4

## --- For `opening_stats.py` ---

### File paths for opening statistics
INPUT_FILE = 'data/generated_data/processed_all_games.json'
OUTPUT_FILE = 'data/generated_data/opening_stats.json'

### Processing limits (for testing/debugging)
MAX_GAMES_TO_PROCESS = None  # Set to a number to limit processing for testing
SAMPLE_SIZE = None  # Set to a number to process only a sample

### Logging configuration
LOG_LEVEL = "INFO"
LOG_FILE = "opening_stats.log"

### Validation settings
MIN_GAMES_FOR_STATISTICS = 10  # Minimum number of games required for meaningful statistics
MIN_PLAYER_ELO = 1000  # Minimum ELO rating to consider
MAX_PLAYER_ELO = 3000  # Maximum ELO rating to consider

### Output settings
INCLUDE_PLAYER_ELOS = True  # Whether to include player ELO data in output
INCLUDE_NEXT_MOVES = True  # Whether to include popular next moves
INCLUDE_OPENING_EVALS = True  # Whether to include opening evaluations
MAX_NEXT_MOVES = 5  # Maximum number of next moves to include
MAX_PLAYERS_PER_OPENING = 10  # Maximum number of players to include per opening

