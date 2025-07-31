#!/usr/bin/env python3
"""
Opening Statistics Tester

This script performs quick tests on opening statistics data and validates
the flexible move detection algorithm with sample data.

Outputs: data/generated_data/opening_stats_test_results.json
"""

import pandas as pd
import json
from collections import Counter
from pathlib import Path
from typing import List, Tuple


def flexible_get_next_moves(move_lists: List[List[str]], opening_moves: List[str], 
                          min_games: int = 3) -> Tuple[Counter, int]:
    """
    Flexible next move detection that tries different opening lengths.
    
    Args:
        move_lists: List of game move sequences
        opening_moves: Expected opening move sequence
        min_games: Minimum number of games required
        
    Returns:
        Tuple of (Counter of next moves, actual opening length used)
    """
    if not move_lists:
        return Counter(), 0
    
    # Determine starting opening length
    if not opening_moves:
        # Use adaptive length based on average game length
        avg_game_length = sum(len(moves) for moves in move_lists) / len(move_lists)
        opening_length = min(8, max(6, int(avg_game_length * 0.2)))
    else:
        opening_length = len(opening_moves)
    
    # Try the exact opening length first
    next_moves = []
    for moves in move_lists:
        if len(moves) > opening_length:
            next_moves.append(moves[opening_length])
    
    # If we don't have enough moves, try shorter lengths
    if len(next_moves) < min_games and opening_length > 4:
        for shorter_length in range(opening_length - 1, 3, -1):
            next_moves = []
            for moves in move_lists:
                if len(moves) > shorter_length:
                    next_moves.append(moves[shorter_length])
            
            if len(next_moves) >= min_games:
                opening_length = shorter_length
                break
    
    # If still not enough, try longer lengths (in case ECO is too short)
    if len(next_moves) < min_games and opening_moves:
        for longer_length in range(opening_length + 1, min(opening_length + 4, 15)):
            next_moves = []
            for moves in move_lists:
                if len(moves) > longer_length:
                    next_moves.append(moves[longer_length])
            
            if len(next_moves) >= min_games:
                opening_length = longer_length
                break
    
    return Counter(next_moves), opening_length


def load_sample_game_data():
    """
    Load sample game data for testing.
    
    Returns:
        DataFrame with sample games or None if not found
    """
    possible_paths = [
        "data/processed_all_games.json",
        "processed_all_games/processed_all_games.json",
        "../processed_all_games.json"
    ]
    
    for path in possible_paths:
        try:
            # Try loading as JSON lines first
            df = pd.read_json(path, lines=True, nrows=2000)  # Limit for testing
            print(f"✓ Loaded sample games from: {path}")
            return df
        except:
            try:
                # Try loading as regular JSON
                df = pd.read_json(path, nrows=2000)
                print(f"✓ Loaded sample games from: {path}")
                return df
            except:
                continue
    
    print("Warning: Could not find processed game data for testing.")
    return None


def create_synthetic_test_data():
    """
    Create synthetic test data for algorithm validation.
    
    Returns:
        Dictionary with synthetic opening data
    """
    synthetic_data = {
        'Sicilian Defense': {
            'opening_moves': ['e4', 'c5', 'Nf3', 'd6'],
            'games': [
                ['e4', 'c5', 'Nf3', 'd6', 'Nc3', 'Nf6', 'Be2'],
                ['e4', 'c5', 'Nf3', 'd6', 'Nc3', 'g6', 'Be3'],
                ['e4', 'c5', 'Nf3', 'd6', 'Nc3', 'Nf6', 'Bd3'],
                ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4'],
                ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Qxd4'],
            ]
        },
        'Queen\'s Gambit': {
            'opening_moves': ['d4', 'Nf6', 'c4', 'e6'],
            'games': [
                ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Be7', 'Nf3'],
                ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'd5', 'Bg5'],
                ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'Be7', 'Bg5'],
                ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'd5', 'Nc3'],
            ]
        },
        'Short Opening': {
            'opening_moves': ['e4', 'e5'],
            'games': [
                ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'],
                ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Be7'],
                ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'g5'],
            ]
        }
    }
    
    return synthetic_data


def test_flexible_algorithm():
    """
    Test the flexible move detection algorithm with various scenarios.
    
    Returns:
        Dictionary with test results
    """
    print("\nTesting flexible move detection algorithm...")
    
    synthetic_data = create_synthetic_test_data()
    test_results = []
    
    for opening_name, data in synthetic_data.items():
        opening_moves = data['opening_moves']
        games = data['games']
        
        print(f"\nTesting: {opening_name}")
        print(f"  Opening moves: {opening_moves} (length: {len(opening_moves)})")
        print(f"  Test games: {len(games)}")
        
        # Test the algorithm
        next_moves, actual_length = flexible_get_next_moves(games, opening_moves)
        
        result = {
            'opening': opening_name,
            'expected_length': len(opening_moves),
            'actual_length_used': actual_length,
            'games_tested': len(games),
            'next_moves_found': len(next_moves),
            'top_next_moves': dict(next_moves.most_common(3)),
            'all_next_moves': dict(next_moves)
        }
        
        test_results.append(result)
        
        print(f"  Expected length: {len(opening_moves)}, Used: {actual_length}")
        print(f"  Next moves found: {len(next_moves)}")
        print(f"  Top moves: {dict(next_moves.most_common(3))}")
    
    return test_results


def test_with_real_data():
    """
    Test the algorithm with real game data if available.
    
    Returns:
        Dictionary with real data test results
    """
    print("\nTesting with real game data...")
    
    df = load_sample_game_data()
    if df is None:
        return {'error': 'No real game data available for testing'}
    
    # Filter for complete data
    df_filtered = df[
        df['opening'].notna() & 
        df['variation'].notna() & 
        df['moves'].notna() &
        df['numMoves'].notna()
    ].copy()
    
    print(f"Filtered to {len(df_filtered)} games with complete data")
    
    # Group by opening-variation and test a few
    opening_groups = df_filtered.groupby(['opening', 'variation'])
    print(f"Found {len(opening_groups)} opening-variation combinations")
    
    test_results = []
    test_count = 0
    
    for (opening, variation), group in opening_groups:
        if test_count >= 10:  # Test only first 10 for performance
            break
            
        games = group
        if len(games) < 5:  # Skip small samples
            continue
            
        print(f"\nTesting: {opening} - {variation} ({len(games)} games)")
        
        # Use a reasonable default for opening moves
        if "Sicilian" in opening:
            opening_moves = ["e4", "c5", "Nf3", "d6"]
        elif "Queen" in opening:
            opening_moves = ["d4", "Nf6", "c4"]
        elif "Ruy" in opening or "Spanish" in opening:
            opening_moves = ["e4", "e5", "Nf3", "Nc6", "Bb5"]
        else:
            opening_moves = ["e4", "e5", "Nf3"]  # Generic default
        
        # Get move lists
        move_lists = games['moves'].tolist()
        
        # Test flexible function
        next_moves, actual_length = flexible_get_next_moves(move_lists, opening_moves)
        
        result = {
            'opening': opening,
            'variation': variation,
            'games_tested': len(games),
            'expected_length': len(opening_moves),
            'actual_length_used': actual_length,
            'next_moves_found': len(next_moves),
            'top_next_moves': dict(next_moves.most_common(5)),
            'success': len(next_moves) > 0
        }
        
        test_results.append(result)
        
        print(f"  Expected: {len(opening_moves)}, Used: {actual_length}")
        print(f"  Next moves: {len(next_moves)}")
        print(f"  Success: {'✓' if len(next_moves) > 0 else '✗'}")
        
        test_count += 1
    
    return test_results


def analyze_test_results(synthetic_results, real_results):
    """
    Analyze and summarize test results.
    
    Args:
        synthetic_results: Results from synthetic data tests
        real_results: Results from real data tests
        
    Returns:
        Dictionary with analysis summary
    """
    analysis = {
        'synthetic_tests': {
            'total_tests': len(synthetic_results),
            'successful_tests': sum(1 for r in synthetic_results if r['next_moves_found'] > 0),
            'average_moves_found': sum(r['next_moves_found'] for r in synthetic_results) / len(synthetic_results) if synthetic_results else 0,
            'length_adjustments': sum(1 for r in synthetic_results if r['actual_length_used'] != r['expected_length'])
        }
    }
    
    if isinstance(real_results, list):
        analysis['real_data_tests'] = {
            'total_tests': len(real_results),
            'successful_tests': sum(1 for r in real_results if r.get('success', False)),
            'average_moves_found': sum(r['next_moves_found'] for r in real_results) / len(real_results) if real_results else 0,
            'length_adjustments': sum(1 for r in real_results if r['actual_length_used'] != r['expected_length']),
            'success_rate': (sum(1 for r in real_results if r.get('success', False)) / len(real_results) * 100) if real_results else 0
        }
    else:
        analysis['real_data_tests'] = {'error': real_results.get('error', 'Unknown error')}
    
    return analysis


def create_test_report(synthetic_results, real_results, analysis):
    """
    Create a comprehensive test report.
    
    Args:
        synthetic_results: Synthetic test results
        real_results: Real data test results
        analysis: Analysis summary
        
    Returns:
        Formatted report string
    """
    report = []
    report.append("=== OPENING STATISTICS ALGORITHM TEST REPORT ===\n")
    
    # Synthetic tests
    report.append("SYNTHETIC DATA TESTS:")
    report.append(f"  Total tests: {analysis['synthetic_tests']['total_tests']}")
    report.append(f"  Successful: {analysis['synthetic_tests']['successful_tests']}")
    report.append(f"  Average moves found: {analysis['synthetic_tests']['average_moves_found']:.1f}")
    report.append(f"  Length adjustments: {analysis['synthetic_tests']['length_adjustments']}")
    report.append("")
    
    # Real data tests
    if 'error' not in analysis['real_data_tests']:
        report.append("REAL DATA TESTS:")
        report.append(f"  Total tests: {analysis['real_data_tests']['total_tests']}")
        report.append(f"  Successful: {analysis['real_data_tests']['successful_tests']}")
        report.append(f"  Success rate: {analysis['real_data_tests']['success_rate']:.1f}%")
        report.append(f"  Average moves found: {analysis['real_data_tests']['average_moves_found']:.1f}")
        report.append(f"  Length adjustments: {analysis['real_data_tests']['length_adjustments']}")
    else:
        report.append("REAL DATA TESTS:")
        report.append(f"  Error: {analysis['real_data_tests']['error']}")
    report.append("")
    
    # Detailed results
    report.append("DETAILED SYNTHETIC TEST RESULTS:")
    for result in synthetic_results:
        report.append(f"  {result['opening']}:")
        report.append(f"    Expected/Used length: {result['expected_length']}/{result['actual_length_used']}")
        report.append(f"    Moves found: {result['next_moves_found']}")
        report.append(f"    Top moves: {result['top_next_moves']}")
    
    return "\n".join(report)


def main():
    """Main function to run opening statistics tests."""
    print("Opening Statistics Algorithm Tester")
    print("=" * 40)
    
    # Run synthetic tests
    synthetic_results = test_flexible_algorithm()
    
    # Run real data tests
    real_results = test_with_real_data()
    
    # Analyze results
    analysis = analyze_test_results(synthetic_results, real_results)
    
    # Create report
    report = create_test_report(synthetic_results, real_results, analysis)
    
    print("\n" + report)
    
    # Save results
    output_dir = Path("data/generated_data")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save test results
    test_data = {
        'synthetic_results': synthetic_results,
        'real_results': real_results,
        'analysis': analysis,
        'test_metadata': {
            'algorithm_version': 'flexible_v2',
            'test_date': str(pd.Timestamp.now()),
            'synthetic_tests_count': len(synthetic_results),
            'real_tests_count': len(real_results) if isinstance(real_results, list) else 0
        }
    }
    
    results_file = output_dir / "opening_stats_test_results.json"
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(test_data, f, indent=2, ensure_ascii=False, default=str)
    
    # Save report
    report_file = output_dir / "opening_stats_test_report.txt"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n✓ Test results saved: {results_file}")
    print(f"✓ Test report saved: {report_file}")
    
    # Print summary
    print(f"\nTEST SUMMARY:")
    print(f"  Synthetic tests: {analysis['synthetic_tests']['successful_tests']}/{analysis['synthetic_tests']['total_tests']} successful")
    
    if 'error' not in analysis['real_data_tests']:
        print(f"  Real data tests: {analysis['real_data_tests']['successful_tests']}/{analysis['real_data_tests']['total_tests']} successful ({analysis['real_data_tests']['success_rate']:.1f}%)")
    else:
        print(f"  Real data tests: {analysis['real_data_tests']['error']}")


if __name__ == "__main__":
    main()