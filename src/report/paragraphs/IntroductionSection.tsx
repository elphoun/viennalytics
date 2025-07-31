import ReportSection from "../../components/report/ReportSection";
import Hyperlink from "../../components/Text/Hyperlink";
import Text from "../../components/Text/Text";

interface IntroductionSectionProps {
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}

const IntroductionSection = ({ sectionRefs }: IntroductionSectionProps) => {
  return (
    <ReportSection id="introduction" title="Introduction" icon="👋" sectionRef={sectionRefs}>
      <Text>
        Chess stands as one of the most enduring and intellectually challenging strategy games in human history.
        With over 18 million games played daily on
        <Hyperlink link="https://www.chess.com/home">Chess.com</Hyperlink>
        alone, the game continues to captivate players across all skill levels, from casual enthusiasts to grandmasters.
      </Text>
      <Text>
        At the heart of every chess game lies the opening - the crucial initial sequence of moves that sets the
        strategic foundation for the entire match. These opening moves are far more than mere formalities; they
        represent centuries of accumulated chess wisdom, theoretical development, and strategic innovation.
      </Text>
      <Text>
        This comprehensive analysis examines chess opening performance using data from
        <Hyperlink link="https://database.lichess.org/#broadcasts">Lichess.org</Hyperlink>
        , one of the world&apos;s largest online chess platforms. Our research focuses on understanding how different
        openings influence game outcomes, player performance, and strategic development across various skill levels.
      </Text>
      <Text>
        The primary objectives of this study include analyzing opening success rates, identifying patterns in
        player preferences, and providing actionable insights for chess improvement at different rating levels.
      </Text>
    </ReportSection>
  );
};

export default IntroductionSection;