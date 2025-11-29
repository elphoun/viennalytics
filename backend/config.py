"""
Configuration File

This module contains configuration settings for all components of the chess analysis pipeline,
including Stockfish engine paths, processing parameters, and other settings.
"""

# Data Output Directory
DATA_DIR = "data/generated_data"

# PGN_DIR
PGN_DIR = "data/pgn"

# ECO_DIR
ECO_DIR = "data/eco"

# Chunk Size. Used to save memory with large files
CHUNK_SIZE = 1000

# PGN Processing chunk size (larger for better performance)
PGN_CHUNK_SIZE = 10000

# --- Stockfish Engine Configuration ---

### Stockfish engine path
STOCKFISH_PATH = r"C:\Users\kalem\OneDrive\Desktop\stockfish-windows-x86-64-avx2\stockfish\stockfish-windows-x86-64-avx2.exe"

### Processing configuration
MAX_WORKERS = 12
STOCKFISH_DEPTH = 10
STOCKFISH_CACHE_SIZE = 10000


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
INPUT_FILE = "data/generated_data/processed_all_games.json"
OUTPUT_FILE = "data/generated_data/opening_stats.json"

### Processing limits (for testing/debugging)
MAX_GAMES_TO_PROCESS = None  # Set to a number to limit processing for testing
SAMPLE_SIZE = None  # Set to a number to process only a sample

### Logging configuration
LOG_LEVEL = "INFO"
LOG_FILE = "opening_stats.log"

### Validation settings
MIN_GAMES_FOR_STATISTICS = (
    10  # Minimum number of games required for meaningful statistics
)
MIN_PLAYER_ELO = 1000  # Minimum ELO rating to consider
MAX_PLAYER_ELO = 3000  # Maximum ELO rating to consider
HIGH_LEVEL_ELO_THRESHOLD = 2000  # ELO threshold for high-level player analysis

### Output settings
INCLUDE_PLAYER_ELOS = True  # Whether to include player ELO data in output
INCLUDE_NEXT_MOVES = True  # Whether to include popular next moves
INCLUDE_OPENING_EVALS = True  # Whether to include opening evaluations
MAX_NEXT_MOVES = 5  # Maximum number of next moves to include
MAX_PLAYERS_PER_OPENING = 10  # Maximum number of players to include per opening
TOP_OPENINGS_COUNT = 50  # Number of top openings to include in visualizations
