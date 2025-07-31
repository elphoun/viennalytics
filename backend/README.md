# Overview | ♟️
This section details how the Viennalytics backend was constructed. It provides a detailed guide on how the data was cleaned ad processed. 

## Prerequisites

- Python 3.8+
- Stockfish chess engine
- Required Python packages (see `requirements.txt`)

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Configure Stockfish

1. Download Stockfish from [Stockfish's Official Website](https://stockfishchess.org/download/)
2. Update `STOCKFISH_PATH` in `config.py` with your Stockfish executable path (if necessary)

## Compile ECO Files

1. Download ECO Files from [this Github Repo](https://github.com/hayatbiralem/eco.json)
2. Update `ECO_DIR` in `config.py` with the directory to your ECO

## Compile PGN Files

1. Download PGN Files from [Lichess.com](https://database.lichess.org/#broadcasts)
2. Update `PGN_DIR` in `config.py` with the directory to your PGN

# Data Processing Steps | 📖

## Step 1: Convert PGN to CSV

**Script:** `convert_pgn_csv.py`

Converts the PGN files to `all_games_info.csv`. 

```bash
python convert_pgn_csv.py
```

## Step 2: Engine Analysis

**Script:** `2-engine_analysis/process_games.py`

Converts `all_games_info.csv` to `processed_add_games.json`

```bash
python process_games.py
```

## Step 3: Generate Opening Statistics

**Script:** 
`3-opening_stats/opening_stats.py` - 

Creates comprehensive statistics for each chess opening and variation.

```bash
cd openingStats
python opening_stats.py
```

## Step 4: Generate Visualization Data

**Scripts:**
```bash
4-visualization/
    ↳ chess_visualization_processors.py
    ↳ elo_analysis_summary.py
    ↳ elo_distribution.py
    ↳ opening_clustering_analysis.py
    ↳ opening_stats_tester.py
    ↳ popular_moves_analyzer.py
    ↳ visualization_data_generator.py
```

Creates specialized JSON files for different types of visualizations.

# Backend TechStack

