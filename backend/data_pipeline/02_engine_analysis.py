# --- Imports ---
import traceback
import pandas as pd
import gc
from tqdm import tqdm
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from eco_utils import load_eco_data, create_eco_lookup
from config import (
    MIN_MOVE_COUNT,
    CHUNK_SIZE,
    CONVERT_PGN_CSV_OUT as INPUT_CSV_GAME_DIR,
    PROCESS_GAMES_OUT,
)
from chess_utils import (
    extract_moves_from_pgn,
    move_sequence_to_list,
    map_game_result,
    create_player_dict,
    PerformanceMonitor,
)


# --- Main Processing Function ---
def process_games(df: pd.DataFrame, batch_size=CHUNK_SIZE) -> pd.DataFrame | None:
    """process_games generates processed_all_games.json, a formatted json file containing metadata on all of the games in all_games_info.csv

    Args:
        df (pd.DataFrame): The all_games_info.csv dataframe
        batch_size (_type_, optional): The batch size to increase performance by saving memory

    Returns:
        pd.DataFrame: The formatted dataframe. Will be turned into a JSON
    """

    # Filter Incomplete Games
    valid_games = df[
        (df["White"].notna())
        & (df["Black"].notna())
        & (df["WhiteElo"].notna())
        & (df["BlackElo"].notna())
        & (df["Result"].notna())
        & (df["Moves"].notna())
        & (df["White"] != "")
        & (df["Black"] != "")
        & (df["WhiteElo"] != 0)
        & (df["BlackElo"] != 0)
        & (df["Result"] != "")
        & (df["Moves"] != "")
    ].copy()

    print(f"Found {len(valid_games)} valid games out of {len(df)} total")

    if valid_games.empty:
        print("No Valid Games")
        return None

    # Extract and process moves from PGN
    valid_games["Moves"] = valid_games["Moves"].apply(extract_moves_from_pgn)
    valid_games["Moves"] = valid_games["Moves"].apply(move_sequence_to_list)
    valid_games["num_moves"] = valid_games["Moves"].apply(len)
    valid_games = valid_games[valid_games["num_moves"] >= MIN_MOVE_COUNT]
    valid_games = valid_games[valid_games["Moves"].str.len() > 0]

    # Loading ECO Data
    eco_data = load_eco_data()
    eco_openings, eco_lookup, move_tree, eco_code_lookup = create_eco_lookup(eco_data)
    print("ECO Data Loaded")
    print(f"Loaded {len(eco_openings)} ECO openings for FEN generation")

    # Processing (in batches)
    results = []
    total_batches = (len(valid_games) + batch_size - 1) // batch_size

    for idx in tqdm(
        range(0, len(valid_games), batch_size),
        total=total_batches,
        desc="Processing batches",
    ):
        batch = valid_games.iloc[idx : idx + batch_size].copy()

        # Use the original "Opening" and "Variant" columns from CSV
        batch["opening"] = batch["Opening"].fillna("Unknown Opening")
        batch["variation"] = batch["Variant"].fillna("")

        # Grouping White and Black into the "Player" JSON type
        batch["white"] = batch.apply(
            lambda row: create_player_dict(row["White"], row["WhiteElo"]), axis=1
        )
        batch["black"] = batch.apply(
            lambda row: create_player_dict(row["Black"], row["BlackElo"]), axis=1
        )

        # Mapping Columns to JSON and Renaming
        batch["result"] = batch["Result"].apply(map_game_result)
        batch["event"] = batch.get("Event", "")
        batch["studyName"] = batch.get("StudyName", "")
        batch["gameURL"] = batch.get("GameURL", "")
        batch["eco"] = batch.get("ECO", "")
        output_columns = {
            "white": "white",
            "black": "black",
            "result": "result",
            "opening": "opening",
            "variation": "variation",
            "eco": "eco",
            "Moves": "moves",
            "num_moves": "numMoves",
            "event": "event",
            "studyName": "studyName",
            "gameURL": "gameURL",
        }

        batch_output = batch[list(output_columns.keys())].rename(columns=output_columns)

        # Fixed: Use "moves" column instead of "moveList"
        critical_columns = ["white", "black", "result", "moves"]
        batch_output = batch_output.dropna(subset=critical_columns)

        results.append(batch_output)

        # Memory management
        del batch
        gc.collect()

        # Show progress
        total_processed = sum(len(r) for r in results)
        print(f"  Processed {total_processed:,} games so far...")

    # Combine all results
    print("Combining results...")
    final_result = pd.concat(results, ignore_index=True)
    return final_result


def main():
    """Main Processing Function"""
    monitor = PerformanceMonitor()

    try:
        print("Loading all_games_info.csv...")
        df = pd.read_csv(INPUT_CSV_GAME_DIR, low_memory=False)
        print(f"Loaded {len(df)} total games")
        result = process_games(df)

        if result is not None and not result.empty:
            print(f"Saving {len(result)} processed games to {PROCESS_GAMES_OUT}...")
            result.to_json(PROCESS_GAMES_OUT, orient="records", indent=2)
            print(f"Successfully saved processed games to {PROCESS_GAMES_OUT}")
        else:
            print("No processed games to save")

        monitor.print_stats("Final")
        print("You can now run opening_stats.py")
    except Exception as ex:
        print(f"Error occurred during processing: {ex}")
        traceback.print_exc()


if __name__ == "__main__":
    main()