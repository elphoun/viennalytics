#!/usr/bin/env python3
"""
Chess Visualization Data Generator

This script generates comprehensive visualization data files from opening statistics.
Creates multiple JSON files optimized for different types of chess data visualizations.

Outputs: Multiple files in data/generated_data/ directory
"""

import json
import os
import sys
from pathlib import Path

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from chess_visualization_processors import (
    create_elo_histogram_data,
    generate_dataset_summary,
    process_elo_distribution,
    process_move_popularity_heatmap,
    process_opening_eval_distribution,
    process_win_rates,
    save_visualization_data,
)
from config import HIGH_LEVEL_ELO_THRESHOLD, TOP_OPENINGS_COUNT
from logging_config import (
    log_data_processing,
    log_error_with_context,
    log_file_operation,
    setup_logging,
)


def load_opening_stats_data(logger):
    """
    Load opening stats data from JSON file.

    Args:
        logger: Logger instance for output

    Returns:
        List of opening dictionaries or empty list if not found
    """
    possible_paths = [
        "data/generated_data/opening_stats.json",
        r"C:\Users\kalem\OneDrive\Desktop\viennalytics\backend\data\generated_data\opening_stats.json",
        "opening_stats.json",
        "../opening_stats.json",
        "data/opening_stats.json",
    ]

    for filename in possible_paths:
        try:
            with open(filename, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Ensure data is in the expected format (list of openings)
            if isinstance(data, list):
                log_file_operation(logger, "Loaded opening stats from", filename)
                return data
            else:
                logger.warning(f"Unexpected data structure in {filename}")
                continue

        except FileNotFoundError:
            continue
        except json.JSONDecodeError as e:
            log_error_with_context(logger, e, f"parsing JSON in {filename}")
            continue

    logger.error("Could not find opening_stats.json file")
    logger.error("Please ensure the file exists in one of these locations:")
    for path in possible_paths:
        logger.error(f"  - {path}")
    return []


def validate_opening_stats_data(opening_stats, logger):
    """
    Validate the structure and content of opening stats data.

    Args:
        opening_stats: List of opening dictionaries
        logger: Logger instance for output

    Returns:
        Tuple of (is_valid, validation_messages)
    """
    if not opening_stats:
        return False, ["No opening stats data provided"]

    if not isinstance(opening_stats, list):
        return False, ["Opening stats must be a list of dictionaries"]

    messages = []
    valid_openings = 0

    for i, opening in enumerate(opening_stats):
        if not isinstance(opening, dict):
            messages.append(f"Opening {i} is not a dictionary")
            continue

        if "opening" not in opening:
            messages.append(f"Opening {i} missing 'opening' field")
            continue

        if "variations" not in opening or not isinstance(opening["variations"], list):
            messages.append(
                f"Opening '{opening['opening']}' missing or invalid 'variations' field"
            )
            continue

        # Check variations
        valid_variations = 0
        for j, variation in enumerate(opening["variations"]):
            if not isinstance(variation, dict):
                continue

            required_fields = [
                "totalGames",
                "winPercentageWhite",
                "winPercentageBlack",
                "drawPercentage",
            ]
            if all(field in variation for field in required_fields):
                valid_variations += 1

        if valid_variations > 0:
            valid_openings += 1
        else:
            messages.append(f"Opening '{opening['opening']}' has no valid variations")

    is_valid = valid_openings > 0
    messages.append(
        f"Found {valid_openings} valid openings out of {len(opening_stats)}"
    )

    return is_valid, messages


def generate_all_visualization_files(opening_stats, logger):
    """
    Generate all visualization data files.

    Args:
        opening_stats: List of opening dictionaries
        logger: Logger instance for output

    Returns:
        Dictionary with generation results
    """
    results = {"files_generated": [], "errors": [], "statistics": {}}

    logger.info("Generating visualization data files...")
    logger.info("=" * 50)

    try:
        # 1. Player ELO Distribution Data
        logger.info("Processing player ELO distribution...")
        elo_data = process_elo_distribution(opening_stats)
        if elo_data:
            save_visualization_data(
                elo_data,
                "player_elo_by_opening.json",
                f"Individual player ELO ratings by opening ({len(elo_data)} records)",
                logger,
            )
            results["files_generated"].append("player_elo_by_opening.json")
            results["statistics"]["elo_records"] = len(elo_data)
        else:
            results["errors"].append("No ELO data found")

        # 2. ELO Histogram Data
        logger.info("Creating ELO histogram bins...")
        histogram_data = create_elo_histogram_data(elo_data)
        if histogram_data["bins"]:
            save_visualization_data(
                histogram_data,
                "elo_histogram_data.json",
                f"ELO histogram with {len(histogram_data['bins'])} bins for {len(histogram_data['openingCounts'])} openings",
                logger,
            )
            results["files_generated"].append("elo_histogram_data.json")
            results["statistics"]["eloBins"] = len(histogram_data["bins"])
        else:
            results["errors"].append("Could not create ELO histogram data")

        # 3. Opening Win Rates (Complete Dataset)
        logger.info("Processing opening win rates...")
        win_rates = process_win_rates(opening_stats)
        if win_rates:
            save_visualization_data(
                win_rates,
                "opening_win_rates_complete.json",
                f"Complete win rate data for {len(win_rates)} openings",
                logger,
            )
            results["files_generated"].append("opening_win_rates_complete.json")
            results["statistics"]["openings_with_win_rates"] = len(win_rates)
        else:
            results["errors"].append("No win rate data generated")

        # 4. Opening Evaluation Distribution
        logger.info("Processing opening evaluations...")
        eval_data = process_opening_eval_distribution(opening_stats)
        total_evaluations = sum(len(v) for v in eval_data.values())
        if total_evaluations > 0:
            save_visualization_data(
                eval_data,
                "opening_evaluation_distribution.json",
                f"Opening evaluations by game result ({total_evaluations} total evaluations)",
                logger,
            )
            results["files_generated"].append("opening_evaluation_distribution.json")
            results["statistics"]["total_evaluations"] = total_evaluations
        else:
            results["errors"].append("No evaluation data found")

        # 5. Move Popularity Heatmap
        logger.info("Processing move popularity heatmap...")
        heatmap_data = process_move_popularity_heatmap(opening_stats)
        if heatmap_data["matrix"]:
            save_visualization_data(
                heatmap_data,
                "move_popularity_heatmap.json",
                f"Move popularity heatmap ({heatmap_data['size']}x{heatmap_data['size']} matrix)",
                logger,
            )
            results["files_generated"].append("move_popularity_heatmap.json")
            results["statistics"]["heatmap_size"] = heatmap_data["size"]
        else:
            results["errors"].append("Could not generate heatmap data")

        # 6. Dataset Summary Statistics
        logger.info("Generating dataset summary...")
        summary = generate_dataset_summary(opening_stats)
        if "error" not in summary:
            save_visualization_data(
                summary,
                "dataset_summary.json",
                f"Complete dataset summary ({summary['dataset_overview']['total_openings']} openings)",
                logger,
            )
            results["files_generated"].append("dataset_summary.json")
            results["statistics"].update(summary["dataset_overview"])
        else:
            results["errors"].append(f"Could not generate summary: {summary['error']}")

        # 7. Top Openings by Popularity (Subset for performance)
        logger.info("Creating top openings subset...")
        if win_rates:
            top_openings = win_rates[:TOP_OPENINGS_COUNT]  # Top openings most popular
            save_visualization_data(
                top_openings,
                "top_openings_by_popularity.json",
                f"Top {len(top_openings)} most popular openings",
                logger,
            )
            results["files_generated"].append("top_openings_by_popularity.json")

        # 8. High-Level Openings (ELO >= HIGH_LEVEL_ELO_THRESHOLD)
        logger.info("Creating high-level openings subset...")
        if elo_data:
            high_level_players = [
                p for p in elo_data if p["elo"] >= HIGH_LEVEL_ELO_THRESHOLD
            ]
            high_level_openings = {}
            for player in high_level_players:
                opening = player["opening"]
                if opening not in high_level_openings:
                    high_level_openings[opening] = []
                high_level_openings[opening].append(player)

            high_level_summary = []
            for opening, players in high_level_openings.items():
                avg_elo = sum(p["elo"] for p in players) / len(players)
                high_level_summary.append(
                    {
                        "opening": opening,
                        "high_level_players": len(players),
                        "average_elo": round(avg_elo, 1),
                    }
                )

            high_level_summary.sort(key=lambda x: x["high_level_players"], reverse=True)

            save_visualization_data(
                high_level_summary,
                "high_level_openings.json",
                "Openings popular among high-rated players (ELO >= 2000)",
                logger,
            )
            results["files_generated"].append("high_level_openings.json")

    except Exception as e:
        results["errors"].append(f"Unexpected error during generation: {str(e)}")
        log_error_with_context(logger, e, "generating visualization files")

    return results


def print_generation_summary(results, logger):
    """
    Print a summary of the file generation process.

    Args:
        results: Dictionary with generation results
        logger: Logger instance for output
    """
    logger.info("=" * 60)
    logger.info("VISUALIZATION DATA GENERATION SUMMARY")
    logger.info("=" * 60)

    logger.info(f"Files successfully generated: {len(results['files_generated'])}")
    for filename in results["files_generated"]:
        logger.info(f"  ✓ {filename}")

    if results["errors"]:
        logger.error(f"Errors encountered: {len(results['errors'])}")
        for error in results["errors"]:
            logger.error(f"  ✗ {error}")

    if results["statistics"]:
        logger.info("Dataset Statistics:")
        for key, value in results["statistics"].items():
            if isinstance(value, (int, float)):
                logger.info(f"  {key.replace('_', ' ').title()}: {value:,}")
            else:
                logger.info(f"  {key.replace('_', ' ').title()}: {value}")

    logger.info("All files saved to: data/generated_data/")
    logger.info("=" * 60)


def main():
    """Main function to generate all visualization data."""
    logger = setup_logging("INFO", "visualization_data_generator")

    logger.info("Chess Visualization Data Generator")
    logger.info("=" * 40)

    # Load opening stats data
    opening_stats = load_opening_stats_data(logger)
    if not opening_stats:
        return

    # Validate data
    logger.info("Validating data structure...")
    is_valid, messages = validate_opening_stats_data(opening_stats, logger)

    for message in messages:
        logger.info(f"  {message}")

    if not is_valid:
        logger.error("Invalid data structure. Cannot proceed with generation.")
        return

    logger.info("Data validation passed")

    # Create output directory
    output_dir = Path("data/generated_data")
    output_dir.mkdir(parents=True, exist_ok=True)
    log_file_operation(logger, "Output directory ready", str(output_dir))

    # Generate all visualization files
    results = generate_all_visualization_files(opening_stats, logger)

    # Print summary
    print_generation_summary(results, logger)

    # Save generation log
    log_file = output_dir / "generation_log.json"
    with open(log_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    log_file_operation(logger, "Generation log saved", str(log_file))

    if results["files_generated"]:
        log_data_processing(
            logger,
            "Successfully generated visualization data files",
            len(results["files_generated"]),
        )
    else:
        logger.warning("No files were generated. Please check the errors above.")


if __name__ == "__main__":
    main()
