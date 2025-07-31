# --- Imports ---
import pandas as pd
import json
import os
import sys
from collections import defaultdict
from tqdm import tqdm

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from stockfish_engine import (
    get_stockfish_eval,
    move_sequence_to_fen,
    get_top_stockfish_moves,
)
from eco_utils import get_proper_opening_info
from chess_utils import get_strongest_player, has_digit
from config import MIN_GAMES_FOR_STATISTICS, INPUT_FILE, OUTPUT_FILE

def main():
    """Main Processing Function"""

    # Check if input file exists
    if not os.path.exists(INPUT_FILE):
        return

    try:
        df = pd.read_json(INPUT_FILE)
    except Exception:
        return

    # Filters games with no valid data.
    df_filtered = df[
        df["opening"].notna()
        & df["variation"].notna()
        & df["moves"].notna()
        & df["numMoves"].notna()
    ].copy()

    # Group by (opening, variation) pairs to use existing data
    openings_dict = {}
    opening_groups = df_filtered.groupby(["opening", "variation"])

    for (opening, variation), group in tqdm(
        opening_groups, total=len(opening_groups), desc="Processing opening groups"
    ):
        # Better Name
        games = group

        # Skip if
        # - not enough games (filter out variations with less than 5 players)
        # - opening or variation is not named correctly
        invalid_group = (
            len(games) < MIN_GAMES_FOR_STATISTICS
            or opening in ["?", "Unknown Opening", ""]
            or pd.isna(opening)
        )
        if invalid_group:
            continue

        # Total Games in Variant
        total_games = len(games)

        # Calculate win/loss/draw percentages for each color
        white_wins = len(games[games["result"] == "white"])
        black_wins = len(games[games["result"] == "black"])
        draws = len(games[games["result"] == "draw"])

        # Format percentages to 2 decimal places
        win_pct_white = round(100 * white_wins / total_games, 2)
        win_pct_black = round(100 * black_wins / total_games, 2)
        draw_pct = round(100 * draws / total_games, 2)
        avg_moves = round(games["numMoves"].mean(), 2)

        # Get all players
        try:
            white_players = [
                (row["white"]["name"], row["white"]["elo"])
                for _, row in games.iterrows()
                if "white" in row and isinstance(row["white"], dict)
            ]
            black_players = [
                (row["black"]["name"], row["black"]["elo"])
                for _, row in games.iterrows()
                if "black" in row and isinstance(row["black"], dict)
            ]
            players = white_players + black_players

            if not players:
                continue

            strongest_player = get_strongest_player(players)
            if has_digit(strongest_player):
                continue
        except Exception:
            continue

        # Get a sample move list for ECO identification
        first_game = games.iloc[0]
        sample_moves = []
        if "moves" in first_game:
            moves_data = first_game["moves"]
            if moves_data is not None and not (
                isinstance(moves_data, float) and pd.isna(moves_data)
            ):
                if isinstance(moves_data, list):
                    sample_moves = moves_data
                elif isinstance(moves_data, str):
                    sample_moves = (
                        moves_data.split("|") if "|" in moves_data else [moves_data]
                    )

        # Get proper opening information from ECO database
        base_opening, variation_name, opening_moves = get_proper_opening_info(opening, variation, sample_moves)

        # Calculate FEN position after opening moves
        fen = None
        opening_eval = None
        if opening_moves:
            fen = move_sequence_to_fen("|".join(opening_moves))
            if fen:
                opening_eval = get_stockfish_eval(fen)
                if opening_eval is None:
                    win_diff = win_pct_white - win_pct_black
                    opening_eval = int(win_diff * 2) 
        else:
            win_diff = win_pct_white - win_pct_black
            opening_eval = int(win_diff * 2)

        top_moves = []
        if fen: 
            top_moves = get_top_stockfish_moves(fen, num_moves=5)

        # Get top 2 games with highest combined ELO
        try:
            games_list = []
            for _, game in games.iterrows():
                white_elo = (
                    game.get("white", {}).get("elo", 0)
                    if isinstance(game.get("white"), dict)
                    else 0
                )
                black_elo = (
                    game.get("black", {}).get("elo", 0)
                    if isinstance(game.get("black"), dict)
                    else 0
                )
                combined_elo = (
                    white_elo if isinstance(white_elo, (int, float)) else 0
                ) + (black_elo if isinstance(black_elo, (int, float)) else 0)

                game_data = {
                    "white": game.get("white", {}),
                    "black": game.get("black", {}),
                    "result": game.get("result", ""),
                    "numMoves": game.get("numMoves", 0),
                    "combinedElo": combined_elo,
                }

                # Add key metadata fields only
                for field in ["event", "studyName", "gameURL"]:
                    if field in game and pd.notna(game[field]) and game[field]:
                        game_data[field] = game[field]

                games_list.append(game_data)

            # Sort and get top 2
            games_list.sort(key=lambda x: x["combinedElo"], reverse=True)
            top_games = games_list[:2]

            # Remove combinedElo
            for game in top_games:
                game.pop("combinedElo", None)
        except Exception:
            top_games = [] 
            
        try:
            player_elos = defaultdict(list)
            for _, game in games.iterrows():
                if isinstance(game.get('white'), dict) and 'name' in game['white']:
                    player_elos[game['white']['name']].append(game['white'].get('elo', 0))
                if isinstance(game.get('black'), dict) and 'name' in game['black']:
                    player_elos[game['black']['name']].append(game['black'].get('elo', 0))
                    
            player_elo_list = [{'name': name, 'elo': elos[0] if elos else 0} for name, elos in player_elos.items()]
        except Exception:
            player_elo_list = []
            
        variation_stats = {
            'variation': variation_name,
            'openingMoves': opening_moves if opening_moves else [],
            'fen': fen,
            'openingEval': opening_eval if opening_eval is not None else 0,
            'totalGames': total_games,
            'winPercentageWhite': win_pct_white,
            'winPercentageBlack': win_pct_black,
            'drawPercentage': draw_pct,
            'averageMoves': avg_moves,
            'strongestPlayer': strongest_player,
            'popularNextMoves': top_moves,
            'playerElos': player_elo_list,
            'topGames': top_games
        }
        
        if base_opening not in openings_dict:
            openings_dict[base_opening] = []
        openings_dict[base_opening].append(variation_stats)

    # After processing all opening groups, create output and save
    output_list = [
        {
            'opening': opening,
            'variations': variations
        }
        for opening, variations in openings_dict.items()
        if opening not in ['?', 'Unknown Opening', '']  # Filter out openings without proper names
    ]

    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(output_list, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error writing output file: {e}")
        return

if __name__ == "__main__":
    main()
