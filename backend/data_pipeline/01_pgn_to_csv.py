# --- Imports ---
import os
import re
import csv
import glob
import pandas as pd
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import PGN_DIR, CONVERT_PGN_CSV_OUT as OUTPUT_FILE, HEADERS, CHUNK_SIZE


class PGNParser:
    """
    Efficiently Parses Large PGN Files
    """

    def __init__(self, pgn_dir, output_file, headers, chunk_size=10000):
        self.pgn_dir = pgn_dir
        self.output_file = output_file
        self.headers = headers
        self.chunk_size = chunk_size

    def parse_pgn_files(self):
        """Parse all PGN files in the directory and convert to CSV"""
        pgn_files = glob.glob(os.path.join(self.pgn_dir, "*.pgn"))
        
        if not pgn_files:
            print(f"No PGN files found in {self.pgn_dir}")
            return

        print(f"Found {len(pgn_files)} PGN files to process")
        
        # Initialize CSV file with headers
        with open(self.output_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(self.headers)

        total_games = 0
        for pgn_file in pgn_files:
            print(f"Processing {pgn_file}...")
            games_processed = self._process_single_file(pgn_file)
            total_games += games_processed
            print(f"Processed {games_processed} games from {pgn_file}")

        print(f"Total games processed: {total_games}")
        print(f"Output saved to: {self.output_file}")

    def _process_single_file(self, pgn_file):
        """Process a single PGN file"""
        games_processed = 0
        current_game = {}
        
        with open(pgn_file, 'r', encoding='utf-8', errors='ignore') as file:
            for line in file:
                line = line.strip()
                
                if line.startswith('[') and line.endswith(']'):
                    # Parse header
                    match = re.match(r'\[(\w+)\s+"([^"]*)"\]', line)
                    if match:
                        key, value = match.groups()
                        current_game[key] = value
                
                elif line and not line.startswith('['):
                    # This is the moves line
                    current_game['Moves'] = line
                    
                    # Process the complete game
                    self._write_game_to_csv(current_game)
                    games_processed += 1
                    current_game = {}

        return games_processed

    def _write_game_to_csv(self, game_data):
        """Write a single game to CSV"""
        row = []
        for header in self.headers:
            row.append(game_data.get(header, ''))
        
        with open(self.output_file, 'a', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(row)


def main():
    """Main function to run PGN to CSV conversion"""
    print("Starting PGN to CSV conversion...")
    
    parser = PGNParser(PGN_DIR, OUTPUT_FILE, HEADERS, CHUNK_SIZE)
    parser.parse_pgn_files()
    
    print("PGN to CSV conversion completed!")


if __name__ == "__main__":
    main()