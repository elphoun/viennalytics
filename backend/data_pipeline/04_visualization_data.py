#!/usr/bin/env python3
"""
Chess Visualization Data Generator

This script generates comprehensive visualization data files from opening statistics.
Creates multiple JSON files optimized for different types of chess data visualizations.

Outputs: Multiple files in data/generated_data/ directory
"""

import json
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chess_visualization_processors import (
    process_elo_distribution,
    process_win_rates,
    process_opening_eval_distribution,
    process_move_popularity_heatmap,
    create_elo_histogram_data,
    generate_dataset_summary,
    save_visualization_data
)
from logging_config import setup_logging, log_file_operation, log_data_processing, log_error_with_context


def load_opening_stats_data(logger):
    """
    Load opening stats data from JSON file.
    
    Args:
        logger: Logger instance for output
    
    Returns:
        List of opening dictionaries or empty list if not found
    """
    possible_paths = [
        "backend/data/generated_data/opening_stats.json",
        "data/generated_data/opening_stats.json",
        "opening_stats.json"
    ]
    
    for filename in possible_paths:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
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
    logger.error("Please run 03_opening_stats.py first")
    return []


def generate_all_visualization_files(opening_stats, logger):
    """
    Generate core visualization data files.
    
    Args:
        opening_stats: List of opening dictionaries
        logger: Logger instance for output
        
    Returns:
        Dictionary with generation results
    """
    results = {
        'files_generated': [],
        'errors': [],
        'statistics': {}
    }
    
    logger.info("Generating visualization data files...")
    
    try:
        # 1. Player ELO Distribution Data
        logger.info("Processing player ELO distribution...")
        elo_data = process_elo_distribution(opening_stats)
        if elo_data:
            save_visualization_data(
                elo_data,
                "player_elo_by_opening.json",
                f"Individual player ELO ratings by opening ({len(elo_data)} records)"
            )
            results['files_generated'].append("player_elo_by_opening.json")
            results['statistics']['elo_records'] = len(elo_data)
        else:
            results['errors'].append("No ELO data found")
        
        # 2. ELO Histogram Data
        logger.info("Creating ELO histogram bins...")
        histogram_data = create_elo_histogram_data(elo_data)
        if histogram_data['bins']:
            save_visualization_data(
                histogram_data,
                "elo_histogram_data.json",
                f"ELO histogram with {len(histogram_data['bins'])} bins"
            )
            results['files_generated'].append("elo_histogram_data.json")
            results['statistics']['eloBins'] = len(histogram_data['bins'])
        else:
            results['errors'].append("Could not create ELO histogram data")
        
        # 3. Opening Win Rates (Complete Dataset)
        logger.info("Processing opening win rates...")
        win_rates = process_win_rates(opening_stats)
        if win_rates:
            save_visualization_data(
                win_rates,
                "opening_win_rates_complete.json",
                f"Complete win rate data for {len(win_rates)} openings"
            )
            results['files_generated'].append("opening_win_rates_complete.json")
            results['statistics']['openings_with_win_rates'] = len(win_rates)
        else:
            results['errors'].append("No win rate data generated")
        
        # 4. Opening Evaluation Distribution
        logger.info("Processing opening evaluations...")
        eval_data = process_opening_eval_distribution(opening_stats)
        total_evaluations = sum(len(v) for v in eval_data.values())
        if total_evaluations > 0:
            save_visualization_data(
                eval_data,
                "opening_evaluation_distribution.json",
                f"Opening evaluations by game result ({total_evaluations} total evaluations)"
            )
            results['files_generated'].append("opening_evaluation_distribution.json")
            results['statistics']['total_evaluations'] = total_evaluations
        else:
            results['errors'].append("No evaluation data found")
        
        # 5. Move Popularity Heatmap
        logger.info("Processing move popularity heatmap...")
        heatmap_data = process_move_popularity_heatmap(opening_stats)
        if heatmap_data['matrix']:
            save_visualization_data(
                heatmap_data,
                "move_popularity_heatmap.json",
                f"Move popularity heatmap ({heatmap_data['size']}x{heatmap_data['size']} matrix)"
            )
            results['files_generated'].append("move_popularity_heatmap.json")
            results['statistics']['heatmap_size'] = heatmap_data['size']
        else:
            results['errors'].append("Could not generate heatmap data")
    
    except Exception as e:
        log_error_with_context(logger, e, "generating visualization files")
        results['errors'].append(f"Unexpected error during generation: {str(e)}")
    
    return results


def main():
    """Main function to generate visualization data."""
    logger = setup_logging(level="INFO", module_name="visualization_data")
    logger.info("Chess Visualization Data Generator")
    
    # Load opening stats data
    opening_stats = load_opening_stats_data(logger)
    if not opening_stats:
        return
    
    log_data_processing(logger, "Loaded openings", len(opening_stats))
    
    # Create output directory
    output_dir = Path("data/generated_data")
    output_dir.mkdir(parents=True, exist_ok=True)
    log_file_operation(logger, "Output directory ready", str(output_dir))
    
    # Generate visualization files
    results = generate_all_visualization_files(opening_stats, logger)
    
    # Log summary
    logger.info("GENERATION SUMMARY")
    
    log_data_processing(logger, "Files generated", len(results['files_generated']))
    for filename in results['files_generated']:
        logger.info(f"  ✓ {filename}")
    
    if results['errors']:
        log_data_processing(logger, "Errors encountered", len(results['errors']))
        for error in results['errors']:
            logger.error(f"  ✗ {error}")


if __name__ == "__main__":
    main()