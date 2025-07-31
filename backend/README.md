## Overview
This section details how the Viennalytics backend was constructed. It provides a detailed guide on how the data was cleaned ad processed. 

## Prerequisites

- Python 3.8+
- Stockfish chess engine
- Required Python packages (see `requirements.txt`)

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Stockfish

1. Download Stockfish from [official website](https://stockfishchess.org/download/)
2. Update `STOCKFISH_PATH` in `config.py` with your Stockfish executable path

## Data Processing Steps

### Step 1: Convert PGN to CSV

**Script:** `convert_pgn_csv.py`

Converts raw PGN files to structured CSV format for easier processing.

```bash
python convert_pgn_csv.py
```

**Input:** 
- PGN files in `data/pgn/` directory

**Output:** 
- `data/generated_data/all_games_info.csv`

**What it does:**
- Parses PGN headers (players, ELO, opening, result, etc.)
- Extracts and cleans move sequences
- Removes duplicates and invalid games
- Validates ELO ratings (500-3500 range)

### Step 2: Process Games with Engine Analysis

**Script:** `process_games.py`
**Dependencies:** `stockfish_engine.py`, `eco_utils.py`, `chess_utils.py`

Enriches game data with chess engine analysis and position evaluation.

```bash
python process_games.py
```

**Input:** 
- `data/generated_data/all_games_info.csv`

**Output:** 
- `processed_all_games.json`

**What it does:**
- Filters games with complete data (players, ELO, moves)
- Converts moves to FEN positions using chess utilities
- Matches openings with ECO database
- Calculates Stockfish evaluations for opening positions
- Processes games in batches for memory efficiency
- Adds metadata (events, study names, URLs)

### Step 3: Generate Opening Statistics

**Script:** `openingStats/opening_stats.py`
**Dependencies:** `openingStats/get_stockfish_data.py`, `openingStats/eco_processor.py`, `openingStats/chess_utils.py`

Creates comprehensive statistics for each chess opening and variation.

```bash
cd openingStats
python opening_stats.py
```

**Input:** 
- `../processed_all_games.json`

**Output:** 
- `opening_stats.json`

**What it does:**
- Groups games by opening and variation using ECO processor
- Calculates win/loss/draw percentages by color
- Identifies strongest players for each opening
- Finds popular next moves after opening sequences
- Evaluates opening positions with Stockfish
- Filters openings with minimum game threshold

### Step 4: Generate Visualization Data

**Script:** `processData/generate_visualization_data.py`
**Dependencies:** `processData/chess_data_processors.py`

Creates specialized JSON files for different types of visualizations.

```bash
cd processData
python generate_visualization_data.py
```

**Input:** 
- `../opening_stats.json`

**Output:** Multiple JSON files in `visualization_data/`:
- `player_elo_by_opening.json` - ELO distributions
- `opening_win_rates_complete.json` - Win rate analysis
- `opening_evaluation_scores_by_result.json` - Engine evaluations
- `first_move_matchup_heatmap.json` - Move matchup matrix
- `elo_histogram_by_opening.json` - ELO histogram data
- `dataset_summary_statistics.json` - Overall statistics

### Step 5: Calculate ELO Distributions (Optional)

**Script:** `calculatingDistribution/elo_distribution.py`

Analyzes ELO rating distributions across different openings.

```bash
cd calculatingDistribution
python elo_distribution.py
```

**What it does:**
- Creates ELO bins (1100-2999 in 100-point ranges)
- Calculates distribution statistics (mean, median, skew)
- Generates opening-specific ELO analysis

## Configuration

### Configuration Files

**`config.py`** - Main configuration:
- Stockfish engine path and settings
- Data directories
- Processing parameters (batch sizes, thresholds)
- Output file names

**`openingStats/config.py`** - Opening analysis settings:
- Minimum games threshold for statistics
- Input/output file paths

### Important Settings

```python
# Stockfish Configuration
STOCKFISH_PATH = "path/to/stockfish.exe"
STOCKFISH_DEPTH = 10
MAX_WORKERS = 12

# Processing Settings
CHUNK_SIZE = 1000
MIN_MOVE_COUNT = 4
MIN_GAMES_FOR_STATISTICS = 5
```

## Data Flow

```
PGN Files → CSV → Processed JSON → Opening Stats → Visualization Data
    ↓         ↓         ↓              ↓              ↓
Raw games  Structured  Engine      Statistics    Charts/Graphs
           data       analysis     & Analysis
```

## Output Data Structure

### Processed Games (`processed_all_games.json`)
```json
{
  "white": {"name": "Player1", "elo": 2000},
  "black": {"name": "Player2", "elo": 1950},
  "result": "white",
  "opening": "Sicilian Defense",
  "variation": "Najdorf Variation",
  "openingFen": "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
  "openingEval": 25,
  "moves": ["e4", "c5", "Nf3", "d6", ...],
  "numMoves": 45
}
```

### Opening Statistics (`opening_stats.json`)
```json
{
  "opening": "Sicilian Defense",
  "variations": [{
    "variation": "Najdorf Variation",
    "totalGames": 1250,
    "winPercentageWhite": 35.2,
    "winPercentageBlack": 32.8,
    "drawPercentage": 32.0,
    "openingEval": 25,
    "strongestPlayer": "Magnus Carlsen",
    "popularNextMoves": [...]
  }]
}
```

## Troubleshooting

### Common Issues

1. **Stockfish not found**: Update `STOCKFISH_PATH` in `config.py`
2. **Memory issues**: Reduce `CHUNK_SIZE` and `MAX_WORKERS`
3. **No PGN files**: Ensure PGN files are in `data/pgn/` directory
4. **Invalid games**: Check PGN format and required headers

### Performance Tips

- Use SSD storage for faster I/O
- Adjust `MAX_WORKERS` based on CPU cores
- Process large datasets in smaller batches
- Monitor memory usage during processing

## File Structure

### Configuration Files
```
├── config.py                    # Main configuration
└── openingStats/config.py       # Opening analysis config
```

### Core Processing Scripts
```
├── convert_pgn_csv.py           # Step 1: PGN to CSV conversion
├── process_games.py             # Step 2: Game processing with engine analysis
└── openingStats/opening_stats.py # Step 3: Opening statistics generation
```

### Stockfish Integration
```
├── stockfish_engine.py          # Stockfish engine wrapper and utilities
└── openingStats/get_stockfish_data.py # Opening-specific Stockfish analysis
```

### Chess Utilities
```
├── chess_utils.py               # General chess utility functions
├── eco_utils.py                 # ECO opening database utilities
├── openingStats/chess_utils.py  # Opening-specific chess utilities
└── openingStats/eco_processor.py # ECO data processing for openings
```

### Data Processing & Visualization
```
├── processData/
│   ├── generate_visualization_data.py  # Step 4: Visualization data generation
│   └── chess_data_processors.py       # Data processing utilities
└── calculatingDistribution/
    └── elo_distribution.py      # Step 5: ELO distribution analysis
```

### Data Directories
```
└── data/
    ├── pgn/                     # Input PGN files
    ├── eco/                     # ECO opening database
    └── generated_data/          # Output files
```

## Next Steps

After completing the data processing pipeline:

1. Use visualization data for creating charts and graphs
2. Implement web dashboard for interactive analysis
3. Add more advanced statistical analysis
4. Create player-specific analysis tools
5. Implement real-time game analysis features