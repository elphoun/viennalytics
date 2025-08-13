
// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import ChessPieceIcon from "../../icons/ChessPieceIcon";
import ReportSection from "../ReportSection";
import Highlight from "../Text/Highlight";
import Hyperlink from "../Text/Hyperlink";
import Paragraph from "../Text/Paragraph";
import PromptOnHighlight from "../Text/PromptOnHighlight";

/**
 * IntroductionSection component provides an introduction to the chess opening analysis.
 * Explains the importance of chess openings and the scope of the analysis.
 */
const IntroductionSection = () => (
  <ReportSection id="introduction" title="Introduction" icon="👋">
    <Paragraph>
      There are very few games more popular than{' '}
      <Highlight text="Chess" icon={<ChessPieceIcon />} color="bg-orange-400/20 text-orange-300 border-orange-400/30" />.
      Over 18 million games are played on
      <Hyperlink link="https://www.chess.com/home">Chess.com</Hyperlink>
      everyday, and the game appeals to various skill demographics as both a casual pastime and a competitive challenge.
    </Paragraph>

    <Paragraph>
      At the core of each chess game is the <Highlight text="Opening" color="bg-orange-400/20 text-orange-300 border-orange-400/30" />.
      Openings serve as the “blueprint” of the game, allowing players to take early advantages by controlling the
      center and increasing their opportunities to trap and capture opposing pieces. As a professional{' '}
      <PromptOnHighlight prompt="Yes ik its not that good stfu">700</PromptOnHighlight>{' '}
      ELO player, I conducted an analysis on the{' '}
      <Hyperlink link="https://database.lichess.org/#broadcasts">lichess.org</Hyperlink>{' '}
      dataset to determine how different openings and opening moves impact later phases of the game.
      I will also discuss how data pertaining to specific players (i.e. ELO, moves) impact the performance of certain openings.
    </Paragraph>
  </ReportSection>
);

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default IntroductionSection;