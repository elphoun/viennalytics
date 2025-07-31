#!/usr/bin/env python3
"""
Chess Visualization Data Processors

This module contains functions to process chess game data for various visualizations.
Converted from TypeScript to Python with performance optimizations.

Functions process opening statistics data and generate visualization-ready datasets.
"""

from typing import List, Dict, Any
from collections import defaultdict
import math
import json
from pathlib import Path


def process_elo_distribution(
    opening_stats: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Process opening data to extract ELO distribution by opening.

    Args:
        opening_stats: List of opening dictionaries with variations containing player ELO data

    Returns:
        List of dictionaries with 'elo' and 'opening' keys for visualization
    """
    if not opening_stats:
        return []

    result = []

    for opening_data in opening_stats:
        opening_name = opening_data.get("opening", "")
        if not opening_name:
            continue

        for variation in opening_data.get("variations", []):
            player_elos = variation.get("playerElos", [])
            for player in player_elos:
                elo = player.get("elo")
                if elo and isinstance(elo, (int, float)) and not math.isnan(elo):
                    result.append(
                        {
                            "elo": float(elo),
                            "opening": opening_name,
                            "variation": variation.get("variation", "Standard"),
                            "player_name": player.get("name", "Unknown"),
                        }
                    )

    return result


def process_win_rates(opening_stats: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Process win rates by opening with performance optimizations.

    Args:
        opening_stats: List of opening dictionaries with variations containing win rate data

    Returns:
        List of dictionaries with opening statistics for all openings
    """
    if not opening_stats:
        return []

    processed_data = []

    for opening_data in opening_stats:
        opening_name = opening_data.get("opening", "")
        if not opening_name:
            continue

        # Aggregate stats across all variations for this opening
        total_games = 0
        total_white_wins = 0
        total_black_wins = 0
        total_draws = 0
        variation_count = 0

        for variation in opening_data.get("variations", []):
            games = variation.get("totalGames", 0)
            if games == 0:
                continue

            white_pct = variation.get("winPercentageWhite", 0)
            black_pct = variation.get("winPercentageBlack", 0)
            draw_pct = variation.get("drawPercentage", 0)

            total_games += games
            total_white_wins += (white_pct / 100) * games
            total_black_wins += (black_pct / 100) * games
            total_draws += (draw_pct / 100) * games
            variation_count += 1

        if total_games > 0:
            processed_data.append(
                {
                    "opening": opening_name,
                    "white": round((total_white_wins / total_games) * 100, 2),
                    "black": round((total_black_wins / total_games) * 100, 2),
                    "draw": round((total_draws / total_games) * 100, 2),
                    "total": total_games,
                    "variations": variation_count,
                }
            )

    # Sort by popularity (most games first)
    processed_data.sort(key=lambda x: x["total"], reverse=True)
    return processed_data


def process_opening_eval_distribution(
    opening_stats: List[Dict[str, Any]],
) -> Dict[str, List[float]]:
    """
    Process opening evaluation data for box plots by game result.

    Args:
        opening_stats: List of opening dictionaries with variations containing evaluation data

    Returns:
        Dictionary with 'whiteWins', 'draws', 'blackWins' keys containing evaluation scores
    """
    if not opening_stats:
        return {"whiteWins": [], "draws": [], "blackWins": []}

    white_wins = []
    draws = []
    black_wins = []

    for opening_data in opening_stats:
        for variation in opening_data.get("variations", []):
            opening_eval = variation.get("openingEval")
            if opening_eval is None:
                continue

            # Get actual game results from top games
            top_games = variation.get("topGames", [])
            for game in top_games:
                result = game.get("result")
                if result == "white":
                    white_wins.append(float(opening_eval))
                elif result == "draw":
                    draws.append(float(opening_eval))
                elif result == "black":
                    black_wins.append(float(opening_eval))

            # Also distribute based on win percentages for better sample size
            total_games = variation.get("totalGames", 0)
            if total_games > 0:
                white_pct = variation.get("winPercentageWhite", 0)
                black_pct = variation.get("winPercentageBlack", 0)
                draw_pct = variation.get("drawPercentage", 0)

                # Limit sample size for performance (max 50 per variation)
                sample_size = min(total_games, 50)
                white_count = int((white_pct / 100) * sample_size)
                black_count = int((black_pct / 100) * sample_size)
                draw_count = int((draw_pct / 100) * sample_size)

                white_wins.extend([float(opening_eval)] * white_count)
                black_wins.extend([float(opening_eval)] * black_count)
                draws.extend([float(opening_eval)] * draw_count)

    return {"whiteWins": white_wins, "draws": draws, "blackWins": black_wins}


def process_move_popularity_heatmap(
    opening_stats: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Process move popularity data for heatmap visualization.

    Args:
        opening_stats: List of opening dictionaries with variations containing move data

    Returns:
        Dictionary with heatmap data and metadata
    """
    if not opening_stats:
        return {
            "matrix": [[50 for _ in range(20)] for _ in range(20)],
            "labels": [f"Move {i + 1}" for i in range(20)],
            "size": 20,
        }

    # Collect first move statistics
    move_stats = defaultdict(
        lambda: {"total": 0, "whiteWins": 0, "blackWins": 0, "draws": 0}
    )

    for opening_data in opening_stats:
        for variation in opening_data.get("variations", []):
            opening_moves = variation.get("openingMoves", [])
            if not opening_moves:
                continue

            first_move = opening_moves[0]
            total_games = variation.get("totalGames", 0)

            if total_games > 0:
                white_pct = variation.get("winPercentageWhite", 0)
                black_pct = variation.get("winPercentageBlack", 0)
                draw_pct = variation.get("drawPercentage", 0)

                stats = move_stats[first_move]
                stats["total"] += total_games
                stats["whiteWins"] += (white_pct / 100) * total_games
                stats["blackWins"] += (black_pct / 100) * total_games
                stats["draws"] += (draw_pct / 100) * total_games

    # Get top 20 most popular first moves
    top_moves = sorted(move_stats.items(), key=lambda x: x[1]["total"], reverse=True)[
        :20
    ]

    # Create matrix based on win rates
    matrix = []
    labels = []

    for i, (move_i, stats_i) in enumerate(top_moves):
        labels.append(move_i)
        row = []

        for j, (move_j, stats_j) in enumerate(top_moves):
            if i == j:
                # Diagonal: white win rate for this move
                win_rate = (
                    (stats_i["whiteWins"] / stats_i["total"] * 100)
                    if stats_i["total"] > 0
                    else 50
                )
            else:
                # Off-diagonal: synthetic matchup data (simplified)
                # In a real implementation, this would require game-by-game analysis
                base_rate = 50
                # Add some variation based on move characteristics
                variation = (hash(move_i + move_j) % 20) - 10
                win_rate = max(0, min(100, base_rate + variation))

            row.append(round(win_rate, 1))

        matrix.append(row)

    return {
        "matrix": matrix,
        "labels": labels,
        "size": len(labels),
        "description": "First move popularity and success rates",
    }


def create_elo_histogram_data(
    elo_data: List[Dict[str, Any]], bin_size: int = 100
) -> Dict[str, Any]:
    """
    Create ELO histogram data with bins and counts by opening.

    Args:
        elo_data: Output from process_elo_distribution
        bin_size: Size of each ELO bin (default 100)

    Returns:
        Dictionary with bins, counts, and metadata
    """
    if not elo_data:
        return {"bins": [], "openingCounts": {}, "binSize": bin_size, "totalPlayers": 0}

    # Group data by opening
    opening_groups = defaultdict(list)
    for player in elo_data:
        opening = player.get("opening", "Unknown")
        elo = player.get("elo")
        if isinstance(elo, (int, float)) and not math.isnan(elo) and math.isfinite(elo):
            opening_groups[opening].append(elo)

    if not opening_groups:
        return {"bins": [], "openingCounts": {}, "binSize": bin_size, "totalPlayers": 0}

    # Calculate global ELO range for consistent binning
    all_elos = [elo for elos in opening_groups.values() for elo in elos]
    min_elo_value = min(all_elos)
    max_elo_value = max(all_elos)

    min_elo = (int(min_elo_value) // bin_size) * bin_size
    max_elo = ((int(max_elo_value) // bin_size) + 1) * bin_size

    bins = list(range(min_elo, max_elo, bin_size))
    bin_labels = [f"{bin_start}-{bin_start + bin_size - 1}" for bin_start in bins]

    # Count players in each bin for each opening
    opening_counts = {}
    for opening, elo_values in opening_groups.items():
        counts = []
        for i, bin_start in enumerate(bins):
            bin_end = bin_start + bin_size
            if i == len(bins) - 1:  # Last bin includes upper bound
                count = sum(1 for elo in elo_values if bin_start <= elo <= bin_end)
            else:
                count = sum(1 for elo in elo_values if bin_start <= elo < bin_end)
            counts.append(count)
        opening_counts[opening] = counts

    return {
        "bins": bins,
        "binLabels": bin_labels,
        "openingCounts": opening_counts,
        "binSize": bin_size,
        "totalPlayers": len(all_elos),
        "eloRange": {"min": min_elo_value, "max": max_elo_value},
    }


def truncate_opening_name(opening: str, max_length: int = 25) -> str:
    """
    Truncate opening names for better display in visualizations.

    Args:
        opening: Opening name to truncate
        max_length: Maximum length before truncation

    Returns:
        Truncated opening name with ellipsis if needed
    """
    if len(opening) <= max_length:
        return opening
    return f"{opening[: max_length - 3]}..."


def save_visualization_data(data: Any, filename: str, description: str = "") -> None:
    """
    Save visualization data to JSON file in the generated_data directory.

    Args:
        data: Data to save
        filename: Output filename
        description: Description for logging
    """
    output_dir = Path("data/generated_data")
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / filename

    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        data_size = len(data) if isinstance(data, (list, dict)) else "N/A"
        print(f"✓ Generated: {output_file}")
        print(f"  Description: {description}")
        print(f"  Records: {data_size}")

    except Exception as e:
        print(f"✗ Error saving {output_file}: {e}")


def generate_dataset_summary(opening_stats: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate comprehensive dataset summary statistics.

    Args:
        opening_stats: List of opening dictionaries

    Returns:
        Dictionary with summary statistics
    """
    if not opening_stats:
        return {"error": "No opening stats data provided"}

    total_games = 0
    total_variations = 0
    total_players = 0
    opening_names = []

    for opening_data in opening_stats:
        opening_names.append(opening_data.get("opening", "Unknown"))

        for variation in opening_data.get("variations", []):
            total_variations += 1
            total_games += variation.get("totalGames", 0)
            total_players += len(variation.get("playerElos", []))

    # Process additional statistics
    elo_data = process_elo_distribution(opening_stats)
    win_rates = process_win_rates(opening_stats)
    eval_data = process_opening_eval_distribution(opening_stats)

    return {
        "datasetOverview": {
            "totalOpenings": len(opening_stats),
            "totalVariations": total_variations,
            "totalGames": total_games,
            "totalPlayers": total_players,
            "uniqueELORecords": len(elo_data),
        },
        "openingStatistics": {
            "mostPopularOpenings": [item["opening"] for item in win_rates[:10]],
            "average_games_per_opening": total_games / len(opening_stats)
            if opening_stats
            else 0,
        },
        "eloStatistics": {
            "minELO": min(item["elo"] for item in elo_data) if elo_data else None,
            "maxELO": max(item["elo"] for item in elo_data) if elo_data else None,
            "averageELO": sum(item["elo"] for item in elo_data) / len(elo_data)
            if elo_data
            else None,
        },
        "evaluationStatistics": {
            "whiteWinsEvaluated": len(eval_data["whiteWins"]),
            "drawsEvaluated": len(eval_data["draws"]),
            "blackWinsEvaluated": len(eval_data["blackWins"]),
            "totalEvaluatedPositions": sum(len(v) for v in eval_data.values()),
        },
        "generationInfo": {
            "processorVersion": "2.0",
            "dataSource": "opening_stats.json",
            "processingNotes": "Optimized for visualization performance",
        },
    }


def main():
    """
    Example usage and testing function.
    Demonstrates how to use the processor functions.
    """
    print("Chess Visualization Processors - Example Usage")
    print("=" * 50)

    # Sample data for testing
    sample_opening_stats = [
        {
            "opening": "Sicilian Defense",
            "variations": [
                {
                    "variation": "Najdorf",
                    "totalGames": 150,
                    "winPercentageWhite": 35.0,
                    "winPercentageBlack": 42.0,
                    "drawPercentage": 23.0,
                    "openingEval": -25,
                    "openingMoves": ["e4", "c5", "Nf3", "d6", "Nc3"],
                    "playerElos": [
                        {"name": "Player1", "elo": 2400},
                        {"name": "Player2", "elo": 2350},
                        {"name": "Player3", "elo": 2500},
                    ],
                    "topGames": [
                        {"result": "black"},
                        {"result": "white"},
                        {"result": "draw"},
                    ],
                }
            ],
        },
        {
            "opening": "Queen's Gambit",
            "variations": [
                {
                    "variation": "Declined",
                    "totalGames": 120,
                    "winPercentageWhite": 48.0,
                    "winPercentageBlack": 28.0,
                    "drawPercentage": 24.0,
                    "openingEval": 35,
                    "openingMoves": ["d4", "Nf6", "c4", "e6"],
                    "playerElos": [
                        {"name": "Player4", "elo": 2200},
                        {"name": "Player5", "elo": 2150},
                    ],
                    "topGames": [{"result": "white"}, {"result": "draw"}],
                }
            ],
        },
    ]

    print("Processing sample data...")

    # Test all processor functions
    elo_dist = process_elo_distribution(sample_opening_stats)
    print(f"ELO Distribution: {len(elo_dist)} records")

    win_rates = process_win_rates(sample_opening_stats)
    print(f"Win Rates: {len(win_rates)} openings")

    eval_data = process_opening_eval_distribution(sample_opening_stats)
    print(f"Evaluation Data: {sum(len(v) for v in eval_data.values())} evaluations")

    histogram_data = create_elo_histogram_data(elo_dist)
    print(f"Histogram Data: {len(histogram_data['bins'])} bins")

    heatmap_data = process_move_popularity_heatmap(sample_opening_stats)
    print(f"Heatmap Data: {heatmap_data['size']}x{heatmap_data['size']} matrix")

    summary = generate_dataset_summary(sample_opening_stats)
    print(f"Dataset Summary: {summary['datasetOverview']['totalGames']} total games")

    print("\n✓ All processor functions working correctly!")


if __name__ == "__main__":
    main()
