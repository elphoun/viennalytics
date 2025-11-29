# --- Imports ---
import csv
import glob
import os
import re
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import CHUNK_SIZE, HEADERS, PGN_CHUNK_SIZE, PGN_DIR
from config import CONVERT_PGN_CSV_OUT as OUTPUT_FILE
from logging_config import log_data_processing, log_file_operation, setup_logging


class PGNParser:
    """
    Efficiently Parses Large PGN Files
    """

    def __init__(
        self, pgn_dir, output_file, headers, chunk_size=PGN_CHUNK_SIZE, logger=None
    ):
        self.pgn_dir = pgn_dir
        self.output_file = output_file
        self.headers = headers
        self.chunk_size = chunk_size
        self.logger = logger or setup_logging(level="INFO", module_name="pgn_parser")

    def parse_pgn_files(self):
        """Parse all PGN files in the directory and convert to CSV"""
        pgn_files = glob.glob(os.path.join(self.pgn_dir, "*.pgn"))

        if not pgn_files:
            self.logger.warning(f"No PGN files found in {self.pgn_dir}")
            return

        log_data_processing(self.logger, "Found PGN files to process", len(pgn_files))

        # Initialize CSV file with headers
        with open(self.output_file, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(self.headers)
        log_file_operation(self.logger, "Created CSV file", self.output_file)

        total_games = 0
        for pgn_file in pgn_files:
            self.logger.info(f"Processing {pgn_file}...")
            games_processed = self._process_single_file(pgn_file)
            total_games += games_processed
            log_data_processing(
                self.logger,
                f"Processed games from {os.path.basename(pgn_file)}",
                games_processed,
            )

        log_data_processing(self.logger, "Total games processed", total_games)
        log_file_operation(self.logger, "Saved output to", self.output_file)

    def _process_single_file(self, pgn_file):
        """Process a single PGN file"""
        games_processed = 0
        current_game = {}

        with open(pgn_file, "r", encoding="utf-8", errors="ignore") as file:
            for line in file:
                line = line.strip()

                if line.startswith("[") and line.endswith("]"):
                    match = re.match(r'\[(\w+)\s+"([^"]*)"\]', line)
                    if match:
                        key, value = match.groups()
                        current_game[key] = value

                elif line and not line.startswith("["):
                    current_game["Moves"] = line

                    self._write_game_to_csv(current_game)
                    games_processed += 1
                    current_game = {}

        return games_processed

    def _write_game_to_csv(self, game_data):
        """Write a single game to CSV"""
        row = []
        for header in self.headers:
            row.append(game_data.get(header, ""))

        with open(self.output_file, "a", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(row)


def main():
    """Main function to run PGN to CSV conversion"""
    logger = setup_logging(level="INFO", module_name="pgn_to_csv")
    logger.info("Starting PGN to CSV conversion...")

    parser = PGNParser(PGN_DIR, OUTPUT_FILE, HEADERS, CHUNK_SIZE, logger)
    parser.parse_pgn_files()

    logger.info("PGN to CSV conversion completed!")


if __name__ == "__main__":
    main()
