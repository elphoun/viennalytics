// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import ChessMinigame from "../../components/ChessMinigame";
import ReportSection from "../ReportSection";
import { H4 } from "../Text";
import Paragraph from "../Text/Paragraph";

/**
 * ConclusionsSection component displays the final conclusions and key findings of the chess analysis.
 * Includes summary of findings and suggestions for future research.
 */
const ConclusionsSection = () => (
  <ReportSection id="conclusions" title="Results and Discussion" icon="🎯">
    <H4 text="ELO Distribution" />
    <Paragraph>
      The LiChess dataset does not contain many games outside of the 1500 to 2700 range.
      As the vast majority of players—around 95% of the population—have a rating outside of this range, the data may not be a complete and accurate representation of the range’s actual opening demographic.
      As a result, individuals with lower skillsets are less likely to benefit directly from studying these games, since the nuances of some positions may not translate well into their level of play.
    </Paragraph>
    <Paragraph>
      That said, if you&apos;re rated above 1500 or simply curious about advanced play, the Opening Explorer still offers valuable insights into high-level strategies and their frequency of use.
    </Paragraph>

    <H4 text="Human Error" />
    <Paragraph>
      Unlike chess engines such as Stockfish, human players cannot play perfectly. There are two general types of mistakes that may affect this dataset:
    </Paragraph>
    <Paragraph>
      <b>Tactical and Positional Blunders:</b> This includes tactical oversights such as hanging a queen or missing checkmate. Additionally, subtle positional errors may accumulate over time, leading to unexpected losses despite having an opening advantage. These errors create inconsistencies in the performance of different openings, leading to an inaccurate assessment of an opening’s true value in the game.
    </Paragraph>
    <Paragraph>
      <b>Time Pressure Effects:</b> While time control was excluded from this analysis since this report focuses on openings, it&apos;s important to acknowledge its impact on game outcomes. In shorter time formats such as blitz or bullet, time constraints lead to lower quality play in the middlegame and endgame. Players sometimes run out of time before completing their games, even in winning positions.
    </Paragraph>

    <Paragraph>
      Consider this position as an example:
    </Paragraph>

    <ChessMinigame
      initialFen="8/7N/8/3k4/8/2K5/5B2/8 w - - 0 1"
      timeLimit={30}
    />

    <Paragraph>
      This position is a guaranteed <b>mate in 38</b> for white. While theoretically possible to execute, the time pressure in faster formats means the game will likely end in a draw due to the 50-move rule or insufficient time. This illustrates how shorter time controls can magnify the impact of time management, often deciding games that would otherwise be straightforward wins.
    </Paragraph>

  </ReportSection>
);

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default ConclusionsSection;