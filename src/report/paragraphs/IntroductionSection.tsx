
import ChessPieceIcon from "../../icons/ChessPieceIcon";
import ReportSection from "../ReportSection";
import Highlight from "../Text/Highlight";
import Hyperlink from "../Text/Hyperlink";
import Paragraph from "../Text/Paragraph";
import PromptOnHighlight from "../Text/PromptOnHighlight";

const IntroductionSection = () => (
  <ReportSection id="introduction" title="Introduction" icon="👋">
    <Paragraph>
      There are very few strategy games more popular than
      <Highlight text="Chess" icon={<ChessPieceIcon />} color="bg-green-600/10 border-green-700/30" />.
      Over 18 million games are played on <Hyperlink link="https://www.chess.com/home">Chess.com</Hyperlink> everyday,
      and the game appeals to various skill demographics as both a casual pastime and a competitive challenge.
    </Paragraph>
    <Paragraph>
      At the core of each chess game is the <Highlight text="Opening" color="bg-green-600/10 border-green-700/30" />.
      Openings serve as the “blueprint” of the game, allowing players to take early advantages by controlling the
      center and increasing their opportunities to trap and capture opposing pieces.
    </Paragraph>
    <Paragraph>
      As a professional
      {' '}
      <PromptOnHighlight prompt="Yes ik its not that good stfu" >700{' '}</PromptOnHighlight>
      ELO player, I conducted an analysis on the
      <Hyperlink link="https://database.lichess.org/#broadcasts">lichess.com</Hyperlink> dataset to determine how different openings and opening moves impact later phases of the game.
      I will also discuss how data pertaining to specific players (i.e. ELO, moves) impact the performance of certain openings.
    </Paragraph>
  </ReportSection>
);

export default IntroductionSection;