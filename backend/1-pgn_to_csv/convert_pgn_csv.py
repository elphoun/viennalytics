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
        self.games_processed - The total number of games processed
        self.games_written - The total number of games processed to OUTPUT_FILE
        self.errors - The number of errors in the data
        self.duplicates - The duplicates processed in the data
        self.seen_games - The games already seen to help process duplciates
    """

    def __init__(self):
        self.games_processed = 0
        self.games_written = 0
        self.errors = 0
        self.duplicates = 0
        self.seen_games = set()

    def parse_headers(self, line):
        """
        Parse a PGN header line like [White "Magnus Carlsen"]

        Args:
            line (str): Header line from PGN

        Returns:
            tuple: (key, value) or (None, None) if invalid header
        """
        # Basic string checking
        line = line.strip()
        if not line.startswith("[") or not line.endswith("]"):
            return (None, None)

        # Extract content between brackets and create key/value pair
        content = line[1:-1]
        space_idx = content.find(" ")
        if space_idx == -1:
            return None, None
        key = content[:space_idx]
        value_part = content[space_idx + 1 :].strip()

        # Remove quotes from value
        if value_part.startswith('"') and value_part.endswith('"'):
            value = value_part[1:-1]
        else:
            value = value_part

        return key, value

    def clean_moves(self, moves_text):
        """
        Clean move text by removing comments, variations, and formatting.

        Args:
            moves_text (str): Raw moves from PGN

        Returns:
            str: Cleaned moves string
        """
        if not moves_text:
            return ""

        # Remove comments in curly braces
        moves_text = re.sub(r"\{[^}]*\}", "", moves_text)

        # Remove fluff like !?, !!, ??, whitespaces, and newlines.
        moves_text = re.sub(r"[!?]+", "", moves_text)
        moves_text = " ".join(moves_text.split())
        moves_text = moves_text.strip()

        return moves_text

    def parse_elo(self, elo_str):
        """
        Parse ELO rating from string, handling various formats.

        Args:
            elo_str (str): ELO rating string

        Returns:
            int: ELO rating or 0 if invalid
        """
        if not elo_str or elo_str == "-":
            return 0

        # Extract numbers from string
        numbers = re.findall(r"\d+", str(elo_str))
        try:
            elo = int(numbers[0])
            if 500 <= elo <= 3500:
                return elo
        except ValueError:
            return 0

    def parse_game(self, game_lines):
        """
        Parse a single game from PGN lines.

        Args:
            game_lines (list): List of lines for one game

        Returns:
            dict or None: Game data dictionary or None if parsing failed
        """
        headers = {}
        moves_lines = []

        # Separate headers and moves
        in_moves = False
        for line in game_lines:
            line = line.strip()
            if not line:
                continue

            if line.startswith("["):
                if not in_moves:
                    key, value = self.parse_headers(line)
                    if key and value:
                        headers[key] = value
            else:
                in_moves = True
                moves_lines.append(line)

        # Extract required fields with defaults
        game_data = {
            "White": headers.get("White", ""),
            "Black": headers.get("Black", ""),
            "WhiteElo": self.parse_elo(headers.get("WhiteElo", "")),
            "BlackElo": self.parse_elo(headers.get("BlackElo", "")),
            "Result": headers.get("Result", ""),
            "Opening": headers.get("Opening", ""),
            "Variant": headers.get("Variant", ""),
            "ECO": headers.get("ECO", ""),
            "Event": headers.get("Event", ""),
            "StudyName": headers.get("StudyName", ""),
            "GameURL": headers.get("GameURL", ""),
            "Moves": self.clean_moves(" ".join(moves_lines)),
        }

        # Validate required fields
        if not all(
            [
                game_data["White"],
                game_data["Black"],
                game_data["Result"],
                game_data["Opening"],
                game_data["Variant"],
            ]
        ):
            return None

        # Check for duplicates (based on players, result, and first few moves)
        game_signature = f"{game_data['White']}|{game_data['Black']}|{game_data['Result']}|{game_data['Moves'][:100]}"
        if game_signature in self.seen_games:
            self.duplicates += 1
            return None

        self.seen_games.add(game_signature)
        return game_data

    def process_pgn(self, filepath):
        """
        Process a single PGN file and yield games.

        Args:
            filepath (str): Path to PGN file

        Yields:
            dict: Game data dictionaries
        """
        print(f"Processing {filepath}...")

        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                current_game_lines = []

                for line_num, line in enumerate(file, 1):
                    line = line.strip()

                    # Empty line might indicate end of game
                    if not line:
                        if current_game_lines:
                            # Check if this looks like end of game
                            last_line = (
                                current_game_lines[-1] if current_game_lines else ""
                            )
                            if any(
                                result in last_line
                                for result in ["1-0", "0-1", "1/2-1/2"]
                            ):
                                game_data = self.parse_game(current_game_lines)
                                if game_data:
                                    yield game_data
                                    self.games_processed += 1
                                else:
                                    self.errors += 1
                                current_game_lines = []
                        continue

                    current_game_lines.append(line)

                    # Show progress periodically
                    if line_num % 100000 == 0:
                        print(
                            f"  Processed {line_num:,} lines, {self.games_processed:,} games"
                        )

                # Process final game if exists
                if current_game_lines:
                    game_data = self.parse_game(current_game_lines)
                    if game_data:
                        yield game_data
                        self.games_processed += 1
                    else:
                        self.errors += 1

        except Exception as e:
            print(f"Error processing {filepath}: {e}")

    def process_pgn_files(self):
        """Creates the CSV by processing the PGN files"""

        # Validate the PGN directory
        pgn_files = glob.glob(os.path.join(PGN_DIR, "*.pgn"))
        if not pgn_files:
            print(f"There were no PGN files found at {PGN_DIR}")
            return

        # Create Output Directory if Necessary
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

        # Process and Write CSV
        with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=HEADERS)
            writer.writeheader()

            # accumulates the games
            cumulative_games = []

            for pgn_file in pgn_files:
                for game_data in self.process_pgn(pgn_file):
                    cumulative_games.append(game_data)

                    if len(cumulative_games) >= CHUNK_SIZE:
                        writer.writerows(cumulative_games)
                        self.games_written += len(cumulative_games)
                        cumulative_games = []

            if cumulative_games:
                writer.writerows(cumulative_games)
                self.games_written += len(cumulative_games)

        print(f"Processing Complete! View results at {OUTPUT_FILE}.")


def validate_csv_output():
    """Validate the generated CSV file."""
    if not os.path.exists(OUTPUT_FILE):
        print("CSV file not found!")
        return

    try:
        # Read a sample to validate structure
        df_sample = pd.read_csv(OUTPUT_FILE, nrows=1000)

        print("\nCSV Validation:")
        print(f"Columns: {list(df_sample.columns)}")
        print(f"Sample size: {len(df_sample)} rows")

        # Check for required columns
        missing_cols = [col for col in HEADERS if col not in df_sample.columns]
        if missing_cols:
            print(f"Missing required columns: {missing_cols}")
        else:
            print("✓ All required columns present")

        # Show sample data
        print("\nSample data:")
        print(df_sample[["White", "Black", "WhiteElo", "BlackElo", "Result"]].head())

        # Show ELO statistics
        valid_white_elo = df_sample[df_sample["WhiteElo"] > 0]["WhiteElo"]
        valid_black_elo = df_sample[df_sample["BlackElo"] > 0]["BlackElo"]

        if len(valid_white_elo) > 0:
            print("\nELO Statistics (sample):")
            print(f"White ELO range: {valid_white_elo.min()} - {valid_white_elo.max()}")
            print(f"Black ELO range: {valid_black_elo.min()} - {valid_black_elo.max()}")

    except Exception as e:
        print(f"Error validating CSV: {e}")


def main():
    """The Main Function"""

    if not os.path.exists(PGN_DIR):
        print(f"The PGN directory was not found: {PGN_DIR}")
        return

    parser = PGNParser()
    parser.process_pgn_files()
    validate_csv_output()
    print("You can now run: python process_all_games.py")


if __name__ == "__main__":
    main()
