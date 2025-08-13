# Chess Data Analysis Pipeline

This directory contains the core data processing pipeline for chess game analysis. The pipeline processes PGN files through multiple stages to generate comprehensive chess opening statistics and visualizations.

## Pipeline Overview

The pipeline consists of 5 sequential steps, each building on the output of the previous step:

```
PGN Files → CSV → Processed Games → Opening Stats → Visualization Data → Clustering Analysis
```

## Pipeline Steps

### 1. PGN to CSV Conversion (`01_pgn_to_csv.py`)
- **Input**: PGN files in `data/pgn/` directory
- **Output**: `data/csvs/all_games_info.csv`
- **Purpose**: Converts chess game files from PGN format to structured CSV format
- **Features**: Handles large files efficiently, extracts game metadata

### 2. Engine Analysis (`02_engine_analysis.py`)
- **Input**: `data/csvs/all_games_info.csv`
- **Output**: `data/generated_data/processed_all_games.json`
- **Purpose**: Processes games, validates data, and structures for analysis
- **Features**: Filters invalid games, extracts move sequences, adds ECO classifications

### 3. Opening Statistics (`03_opening_stats.py`)
- **Input**: `data/generated_data/processed_all_games.json`
- **Output**: `data/generated_data/opening_stats.json`
- **Purpose**: Generates comprehensive statistics for each chess opening
- **Features**: 
  - Win/loss/draw percentages by color
  - Stockfish engine evaluations
  - Player ELO analysis
  - Popular next moves
  - Representative games

### 4. Visualization Data (`04_visualization_data.py`)
- **Input**: `data/generated_data/opening_stats.json`
- **Output**: Multiple JSON files for different visualizations
- **Purpose**: Creates optimized data files for web visualizations
- **Generated Files**:
  - `player_elo_by_opening.json` - ELO distributions
  - `elo_histogram_data.json` - Histogram data
  - `opening_win_rates_complete.json` - Win rate data
  - `opening_evaluation_distribution.json` - Engine evaluations
  - `move_popularity_heatmap.json` - Move popularity data

### 5. Clustering Analysis (`05_clustering_analysis.py`)
- **Input**: `data/generated_data/opening_win_rates_complete.json`
- **Output**: Clustering results and visualization
- **Purpose**: Groups openings by playing style using K-means clustering
- **Features**:
  - Enhanced feature engineering
  - Optimal cluster selection
  - Quality metrics validation
  - Comprehensive cluster analysis
- **Generated Files**:
  - `opening_clusters.json` - Detailed clustering results
  - `opening_clusters_simple.json` - Simplified results
  - `opening_cluster_visualization.png` - Multi-panel visualization

## Running the Pipeline

### Run Complete Pipeline
```bash
python run_pipeline.py
```

### Run Specific Step
```bash
python run_pipeline.py --step 3
```

### Run From Specific Step
```bash
python run_pipeline.py --from-step 4
```

### List All Steps
```bash
python run_pipeline.py --list
```

## Individual Script Usage

Each script can also be run independently:

```bash
# From backend directory
python data_pipeline/01_pgn_to_csv.py
python data_pipeline/02_engine_analysis.py
python data_pipeline/03_opening_stats.py
python data_pipeline/04_visualization_data.py
python data_pipeline/05_clustering_analysis.py
```

## Dependencies

All scripts depend on the following modules from the parent directory:
- `config.py` - Configuration settings
- `chess_utils.py` - Chess-specific utilities
- `eco_utils.py` - ECO opening classification
- `stockfish_engine.py` - Stockfish engine interface
- `chess_visualization_processors.py` - Visualization data processors

## Data Flow

```
data/pgn/*.pgn
    ↓ (01_pgn_to_csv.py)
data/csvs/all_games_info.csv
    ↓ (02_engine_analysis.py)
data/generated_data/processed_all_games.json
    ↓ (03_opening_stats.py)
data/generated_data/opening_stats.json
    ↓ (04_visualization_data.py)
data/generated_data/[multiple visualization files]
    ↓ (05_clustering_analysis.py)
data/generated_data/opening_clusters.json
```

## Output Files

The pipeline generates the following key files in `data/generated_data/`:

### Core Data Files
- `processed_all_games.json` - Processed game data
- `opening_stats.json` - Complete opening statistics

### Visualization Files
- `player_elo_by_opening.json` - Player ELO data
- `elo_histogram_data.json` - ELO distribution histograms
- `opening_win_rates_complete.json` - Win rate statistics
- `opening_evaluation_distribution.json` - Engine evaluations
- `move_popularity_heatmap.json` - Move popularity matrix

### Analysis Files
- `opening_clusters.json` - Detailed clustering analysis
- `opening_clusters_simple.json` - Simplified clustering results
- `opening_cluster_visualization.png` - Clustering visualization

## Error Handling

Each script includes comprehensive error handling and will:
- Check for required input files
- Validate data structure and content
- Provide clear error messages
- Skip invalid data gracefully
- Generate logs of processing results

## Performance Considerations

- Scripts process data in batches to manage memory usage
- Large datasets are handled efficiently with pandas
- Progress bars show processing status
- Intermediate results are saved to prevent data loss

## Configuration

Key settings are defined in `../config.py`:
- File paths and directories
- Processing parameters
- Engine settings
- Statistical thresholds