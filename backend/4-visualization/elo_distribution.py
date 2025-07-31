from pathlib import Path
import numpy as np
import json

# Define your 19 ELO bins and their corresponding ranges
elo_ranges = [
    "1100-1199",
    "1200-1299",
    "1300-1399",
    "1400-1499",
    "1500-1599",
    "1600-1699",
    "1700-1799",
    "1800-1899",
    "1900-1999",
    "2000-2099",
    "2100-2199",
    "2200-2299",
    "2300-2399",
    "2400-2499",
    "2500-2599",
    "2600-2699",
    "2700-2799",
    "2800-2899",
    "2900-2999",
]

# Corresponding midpoints used for weighted mean/median
elo_midpoints = [(int(r.split("-")[0]) + int(r.split("-")[1])) / 2 for r in elo_ranges]

def get_elo_bin_index(elo):
    """Get the index of the ELO bin for a given ELO rating."""
    if elo < 1100:
        return 0
    elif elo >= 3000:
        return len(elo_ranges) - 1
    else:
        return min(int((elo - 1100) // 100), len(elo_ranges) - 1)

def generate_opening_data_from_json():
    """Generate OPENING_DATA from opening_stats.json file."""
    try:
        with open('data/generated_data/opening_stats.json', 'r', encoding='utf-8') as f:
            opening_stats = json.load(f)
        
        opening_data = {}
        
        for opening_entry in opening_stats:
            opening_name = opening_entry['opening']
            
            # Initialize ELO distribution for this opening
            elo_distribution = [0] * len(elo_ranges)
            
            # Process all variations for this opening
            for variation in opening_entry['variations']:
                player_elos = variation.get('playerElos', [])
                
                # Count players in each ELO bin
                for player in player_elos:
                    elo = player.get('elo', 0)
                    if elo > 0:  # Only count valid ELO ratings
                        bin_index = get_elo_bin_index(elo)
                        elo_distribution[bin_index] += 1
            
            # Only add openings that have player data
            if sum(elo_distribution) > 0:
                opening_data[opening_name] = elo_distribution
        
        return opening_data
    
    except FileNotFoundError:
        print("Error: opening_stats.json file not found. Using empty data.")
        return {}
    except json.JSONDecodeError:
        print("Error: Invalid JSON in opening_stats.json file. Using empty data.")
        return {}

# Generate opening data from JSON file
OPENING_DATA = generate_opening_data_from_json()

# Optional: map numeric value back to range string
def map_to_range(value):
    for i, midpoint in enumerate(elo_midpoints):
        lower = midpoint - 50
        upper = midpoint + 49
        if lower <= value <= upper:
            return elo_ranges[i]
    return "Out of range"


def weighted_median(values, weights):
    sorted_indices = np.argsort(values)
    values, weights = (
        np.array(values)[sorted_indices],
        np.array(weights)[sorted_indices],
    )
    cumulative_weights = np.cumsum(weights)
    total_weight = cumulative_weights[-1]
    return values[np.searchsorted(cumulative_weights, total_weight / 2)]


def getSkew():
    output_lines = []
    output_lines.append("Chess Opening ELO Distribution Analysis")
    output_lines.append("=" * 50)
    output_lines.append("")

    for opening, distribution in OPENING_DATA.items():
        total_players = sum(distribution)
        if total_players == 0:
            continue

        # Calculate weighted mean
        weighted_mean = sum(
            count * midpoint for count, midpoint in zip(distribution, elo_midpoints)
        ) / total_players

        # Calculate weighted median
        weighted_med = weighted_median(elo_midpoints, distribution)

        # Calculate skewness
        # First, calculate the weighted variance
        weighted_variance = sum(
            count * (midpoint - weighted_mean) ** 2
            for count, midpoint in zip(distribution, elo_midpoints)
        ) / total_players

        weighted_std = np.sqrt(weighted_variance)

        # Calculate skewness
        if weighted_std > 0:
            weighted_skewness = sum(
                count * ((midpoint - weighted_mean) / weighted_std) ** 3
                for count, midpoint in zip(distribution, elo_midpoints)
            ) / total_players
        else:
            weighted_skewness = 0

        # Find the mode (most frequent ELO range)
        mode_index = np.argmax(distribution)
        mode_range = elo_ranges[mode_index]
        mode_count = distribution[mode_index]

        output_lines.append(f"Opening: {opening}")
        output_lines.append(f"  Total Players: {total_players}")
        output_lines.append(f"  Weighted Mean ELO: {weighted_mean:.1f}")
        output_lines.append(f"  Weighted Median ELO: {weighted_med:.1f}")
        output_lines.append(f"  Weighted Standard Deviation: {weighted_std:.1f}")
        output_lines.append(f"  Weighted Skewness: {weighted_skewness:.3f}")
        output_lines.append(f"  Mode (Most Common Range): {mode_range} ({mode_count} players)")

        # Interpretation of skewness
        if weighted_skewness > 0.5:
            skew_interpretation = "Right-skewed (more lower-rated players)"
        elif weighted_skewness < -0.5:
            skew_interpretation = "Left-skewed (more higher-rated players)"
        else:
            skew_interpretation = "Approximately symmetric"

        output_lines.append(f"  Distribution Shape: {skew_interpretation}")
        output_lines.append("")

    return "\n".join(output_lines)


if __name__ == "__main__":
    print("Generating ELO distribution data from opening_stats.json...")
    print(f"Found {len(OPENING_DATA)} openings with player data.")
    print("\nAnalysis Results:")
    
    # Create output directory
    output_dir = Path("data/generated_data")
    # Save report
    report_file = output_dir / "elo_analysis_report.txt"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(getSkew())
    
    