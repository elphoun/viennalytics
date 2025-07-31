#!/usr/bin/env python3
"""
Popular Moves Analyzer and Fixer

This script analyzes and fixes issues with popular next moves in opening statistics.
It provides flexible opening detection and validates chess move notation.

Outputs: data/generated_data/popular_moves_analysis.json
"""

import json
import re
import sys
import os
from collections import Counter, defaultdict
from pathlib import Path
from typing import List, Dict, Any, Tuple


def is_valid_chess_move(move: str) -> bool:
    """
    Validate if a move is in proper chess algebraic notation.
    
    Args:
        move: Chess move string to validate
        
    Returns:
        True if move is valid chess notation, False otherwise
    """
    if not move or not isinstance(move, str):
        return False
    
    # Clean the move (remove annotations and whitespace)
    clean_move = move.strip().rstrip('!?+#=')
    
    if not clean_move:
        return False
    
    # Filter out obvious non-moves
    invalid_patterns = [
        r'^\d+\.+.*',  # Move numbers like "7..." or "7.e4"
        r'^\.+$',      # Just dots
        r'^\d+$',      # Just numbers
        r'^$',         # Empty string
        r'^\s+$',      # Just whitespace
        r'^[^a-zA-Z0-9O-]',  # Starts with invalid character
    ]
    
    for pattern in invalid_patterns:
        if re.match(pattern, clean_move):
            return False
    
    # Valid chess move patterns
    valid_patterns = [
        # Castling
        r'^O-O(-O)?$',
        r'^0-0(-0)?$',  # Alternative castling notation
        
        # Piece moves (with optional disambiguation and capture)
        r'^[KQRBN][a-h]?[1-8]?x?[a-h][1-8]$',
        
        # Pawn moves (including captures and promotions)
        r'^[a-h][1-8]$',                    # Simple pawn move
        r'^[a-h]x[a-h][1-8]$',             # Pawn capture
        r'^[a-h][18]=[QRBN]$',              # Pawn promotion
        r'^[a-h]x[a-h][18]=[QRBN]$',       # Pawn capture with promotion
        
        # En passant (rare but valid)
        r'^[a-h]x[a-h][36](\s+e\.p\.)?$',
    ]
    
    for pattern in valid_patterns:
        if re.match(pattern, clean_move):
            return True
    
    return False


def flexible_get_next_moves(move_lists: List[List[str]], opening_moves: List[str], 
                          min_games: int = 3) -> Tuple[Counter, int]:
    """
    Flexible next move detection that tries different opening lengths.
    
    Args:
        move_lists: List of game move sequences
        opening_moves: Expected opening move sequence
        min_games: Minimum number of games required for a valid result
        
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
            candidate_move = moves[opening_length]
            if is_valid_chess_move(candidate_move):
                next_moves.append(candidate_move)
    
    # If we don't have enough valid moves, try shorter lengths
    if len(next_moves) < min_games and opening_length > 4:
        for shorter_length in range(opening_length - 1, 3, -1):
            next_moves = []
            for moves in move_lists:
                if len(moves) > shorter_length:
                    candidate_move = moves[shorter_length]
                    if is_valid_chess_move(candidate_move):
                        next_moves.append(candidate_move)
            
            if len(next_moves) >= min_games:
                opening_length = shorter_length
                break
    
    # If still not enough, try longer lengths (in case ECO is too short)
    if len(next_moves) < min_games and opening_moves:
        for longer_length in range(opening_length + 1, min(opening_length + 4, 15)):
            next_moves = []
            for moves in move_lists:
                if len(moves) > longer_length:
                    candidate_move = moves[longer_length]
                    if is_valid_chess_move(candidate_move):
                        next_moves.append(candidate_move)
            
            if len(next_moves) >= min_games:
                opening_length = longer_length
                break
    
    return Counter(next_moves), opening_length


def analyze_opening_stats_file(file_path: str) -> Dict[str, Any]:
    """
    Analyze the opening stats file for popular moves issues.
    
    Args:
        file_path: Path to the opening stats JSON file
        
    Returns:
        Dictionary with analysis results
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        return {'error': f'File not found: {file_path}'}
    except json.JSONDecodeError as e:
        return {'error': f'Invalid JSON: {e}'}
    
    if not isinstance(data, list):
        return {'error': 'Expected list of opening dictionaries'}
    
    analysis = {
        'total_openings': len(data),
        'total_variations': 0,
        'empty_popular_moves': 0,
        'invalid_moves_found': 0,
        'problematic_variations': [],
        'move_validation_stats': defaultdict(int),
        'opening_length_distribution': defaultdict(int),
        'games_per_variation_stats': []
    }
    
    for opening in data:
        opening_name = opening.get('opening', 'Unknown')
        
        for variation in opening.get('variations', []):
            analysis['total_variations'] += 1
            variation_name = variation.get('variation', 'Standard')
            
            # Check popular moves
            popular_moves = variation.get('popularNextMoves', [])
            opening_moves = variation.get('openingMoves', [])
            total_games = variation.get('totalGames', 0)
            
            analysis['games_per_variation_stats'].append(total_games)
            analysis['opening_length_distribution'][len(opening_moves)] += 1
            
            if not popular_moves:
                analysis['empty_popular_moves'] += 1
                analysis['problematic_variations'].append({
                    'opening': opening_name,
                    'variation': variation_name,
                    'issue': 'empty_popular_moves',
                    'opening_moves_count': len(opening_moves),
                    'total_games': total_games
                })
            else:
                # Validate moves in popular moves
                for move_data in popular_moves:
                    move = move_data.get('move', '')
                    if move:
                        is_valid = is_valid_chess_move(move)
                        analysis['move_validation_stats']['valid' if is_valid else 'invalid'] += 1
                        
                        if not is_valid:
                            analysis['invalid_moves_found'] += 1
                            analysis['problematic_variations'].append({
                                'opening': opening_name,
                                'variation': variation_name,
                                'issue': 'invalid_move',
                                'invalid_move': move,
                                'total_games': total_games
                            })
    
    # Calculate statistics
    if analysis['games_per_variation_stats']:
        games_stats = analysis['games_per_variation_stats']
        analysis['games_statistics'] = {
            'min': min(games_stats),
            'max': max(games_stats),
            'average': sum(games_stats) / len(games_stats),
            'median': sorted(games_stats)[len(games_stats) // 2]
        }
    
    # Calculate percentages
    if analysis['total_variations'] > 0:
        analysis['empty_moves_percentage'] = (analysis['empty_popular_moves'] / analysis['total_variations']) * 100
        analysis['invalid_moves_percentage'] = (analysis['invalid_moves_found'] / analysis['total_variations']) * 100
    
    return analysis


def generate_fix_recommendations(analysis: Dict[str, Any]) -> List[str]:
    """
    Generate recommendations for fixing popular moves issues.
    
    Args:
        analysis: Analysis results from analyze_opening_stats_file
        
    Returns:
        List of recommendation strings
    """
    recommendations = []
    
    if analysis.get('empty_moves_percentage', 0) > 20:
        recommendations.append(
            "HIGH PRIORITY: Over 20% of variations have empty popular moves. "
            "Consider implementing flexible opening length detection."
        )
    
    if analysis.get('invalid_moves_percentage', 0) > 5:
        recommendations.append(
            "MEDIUM PRIORITY: Invalid chess moves detected. "
            "Implement move validation in the data processing pipeline."
        )
    
    # Check opening length distribution
    length_dist = analysis.get('opening_length_distribution', {})
    if length_dist:
        most_common_length = max(length_dist.items(), key=lambda x: x[1])[0]
        if most_common_length < 4:
            recommendations.append(
                "Consider using longer opening sequences (6-8 moves) for better move detection."
            )
    
    # Check game count distribution
    games_stats = analysis.get('games_statistics', {})
    if games_stats.get('average', 0) < 20:
        recommendations.append(
            "Many variations have few games. Consider aggregating similar variations or "
            "using lower thresholds for popular move detection."
        )
    
    if not recommendations:
        recommendations.append("No major issues detected. Data quality appears good.")
    
    return recommendations


def create_analysis_report(analysis: Dict[str, Any]) -> str:
    """
    Create a human-readable analysis report.
    
    Args:
        analysis: Analysis results
        
    Returns:
        Formatted report string
    """
    if 'error' in analysis:
        return f"Error: {analysis['error']}"
    
    report = []
    report.append("=== POPULAR MOVES ANALYSIS REPORT ===\n")
    
    # Overview
    report.append("OVERVIEW:")
    report.append(f"  Total openings: {analysis['total_openings']}")
    report.append(f"  Total variations: {analysis['total_variations']}")
    report.append(f"  Empty popular moves: {analysis['empty_popular_moves']} ({analysis.get('empty_moves_percentage', 0):.1f}%)")
    report.append(f"  Invalid moves found: {analysis['invalid_moves_found']} ({analysis.get('invalid_moves_percentage', 0):.1f}%)")
    report.append("")
    
    # Games statistics
    games_stats = analysis.get('games_statistics', {})
    if games_stats:
        report.append("GAMES PER VARIATION:")
        report.append(f"  Average: {games_stats['average']:.1f}")
        report.append(f"  Median: {games_stats['median']}")
        report.append(f"  Range: {games_stats['min']} - {games_stats['max']}")
        report.append("")
    
    # Opening length distribution
    length_dist = analysis.get('opening_length_distribution', {})
    if length_dist:
        report.append("OPENING LENGTH DISTRIBUTION:")
        for length, count in sorted(length_dist.items()):
            percentage = (count / analysis['total_variations']) * 100
            report.append(f"  {length} moves: {count} variations ({percentage:.1f}%)")
        report.append("")
    
    # Move validation stats
    move_stats = analysis.get('move_validation_stats', {})
    if move_stats:
        total_moves = sum(move_stats.values())
        report.append("MOVE VALIDATION:")
        for status, count in move_stats.items():
            percentage = (count / total_moves) * 100 if total_moves > 0 else 0
            report.append(f"  {status.title()}: {count} ({percentage:.1f}%)")
        report.append("")
    
    # Top problematic variations
    problems = analysis.get('problematic_variations', [])
    if problems:
        report.append("TOP PROBLEMATIC VARIATIONS:")
        # Group by issue type
        by_issue = defaultdict(list)
        for problem in problems:
            by_issue[problem['issue']].append(problem)
        
        for issue_type, issue_problems in by_issue.items():
            report.append(f"  {issue_type.replace('_', ' ').title()}:")
            for problem in sorted(issue_problems, key=lambda x: x.get('total_games', 0), reverse=True)[:5]:
                report.append(f"    - {problem['opening']} ({problem['variation']}) - {problem.get('total_games', 0)} games")
        report.append("")
    
    # Recommendations
    recommendations = generate_fix_recommendations(analysis)
    report.append("RECOMMENDATIONS:")
    for i, rec in enumerate(recommendations, 1):
        report.append(f"  {i}. {rec}")
    
    return "\n".join(report)


def main():
    """Main function to analyze popular moves."""
    print("Popular Moves Analyzer")
    print("=" * 30)
    
    # Look for opening stats file
    possible_paths = [
        "data/generated_data/opening_stats.json",
        "opening_stats.json",
        "../opening_stats.json"
    ]
    
    stats_file = None
    for path in possible_paths:
        if Path(path).exists():
            stats_file = path
            break
    
    if not stats_file:
        print("Error: opening_stats.json file not found.")
        print("Please ensure the opening stats file exists in one of these locations:")
        for path in possible_paths:
            print(f"  - {path}")
        return
    
    print(f"Analyzing: {stats_file}")
    
    # Perform analysis
    analysis = analyze_opening_stats_file(stats_file)
    
    if 'error' in analysis:
        print(f"Error: {analysis['error']}")
        return
    
    # Generate report
    report = create_analysis_report(analysis)
    print("\n" + report)
    
    # Save results
    output_dir = Path("data/generated_data")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save analysis data
    analysis_file = output_dir / "popular_moves_analysis.json"
    with open(analysis_file, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False, default=str)
    
    # Save report
    report_file = output_dir / "popular_moves_report.txt"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n✓ Analysis saved: {analysis_file}")
    print(f"✓ Report saved: {report_file}")
    
    # Print summary
    print(f"\nSUMMARY:")
    print(f"  Analyzed {analysis['total_variations']} variations")
    print(f"  Found {analysis['empty_popular_moves']} with empty moves ({analysis.get('empty_moves_percentage', 0):.1f}%)")
    print(f"  Found {analysis['invalid_moves_found']} invalid moves")


if __name__ == "__main__":
    main()