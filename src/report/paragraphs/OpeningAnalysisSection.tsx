import ReportSection from "../../components/report/ReportSection";
import Quote from "../../components/report/Text/Quote";
import SectionHeader from "../../components/Text/SectionHeadet";
import Text from "../../components/Text/Text";

interface OpeningAnalysisSectionProps {
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}

const OpeningAnalysisSection = ({ sectionRefs }: OpeningAnalysisSectionProps) => {
  return (
    <ReportSection id="opening-analysis" title="Opening Analysis" icon="♟️" sectionRef={sectionRefs}>
      <SectionHeader text="Topic 1: ELO correlating with the Opening" />
      <Quote
        quote="The game of the gods. Infinite possibilities."
        author="Vladimir Nabokov"
        className="mb-6"
      />

      <Text>
        One of the biggest differences between a high and low ranked chess player is their understanding
        of the theoretical possibilities behind each of their moves. Higher ELO players don&apos;t just memorize
        their lines; they anticipate their opponents moves and adjust their play accordingly. They understand
        the strategy and potential behind each of the moves and their positional advantages.
      </Text>

      <Text>
        This concept is no different for openings. For example, the Scandinavian is a highly theoretical,
        counter-intuitive opening where black sacrifices a pawn on the first turn to white. Despite this,
        it is an extremely strong opening that counters white&apos;s most common e4 opening. Take the following game:{' '}
      </Text>

      <div className="flex flex-col md:flex-row-reverse gap-5 w-full h-fit overflow-hidden">
        <div className="flex flex-col md:max-w-1/3 gap-5">
          <Text>
            White opens the game with the standard move e4. Black then responds with d5, seemingly giving up
            the pawn. After the two sides trade away their pieces however, black is able to gain positional
            advantage by bringing out their light-squared bishop to pin the f3 knight to the queen and pressuring
            the d4 pawn. They are able to carry this momentum to the end of the game with a win by resignation
            on turn 29.
          </Text>
          <Text>
            While these types of openings rarely follow the player&apos;s intuitive understanding of the game, they
            begin to make sense as they become more accustomed to the importance of positional advantages. This
            section seeks to analyze these openings in terms of how successful and common they are relative to
            certain ELO ranges.
          </Text>
        </div>
        <iframe
          id="13652316"
          allowTransparency
          title="13652316"
          className="rounded-2xl scrollbar-thin flex-1"
          style={{ width: '100%', border: 'none', height: 'fit-content' }}
          src="https://www.chess.com/emboard?id=13652316"
        />
      </div>

      <Text>
        Analysis of opening usage patterns reveals fascinating insights about player behavior across different skill levels.
        Most openings have a much higher negative skew (ranging from -2.063 to 0.713) with the mean ELO ranges typically
        much higher, with over 171 openings averaging 2700-2799 ELO. This means that higher rated players tend to play
        a wider variety of openings.
      </Text>

      <Text>
        <span className="text-orange-300 font-semibold">Common Openings</span> with more standard moves like the Caro-Kann
        and Vienna Game are more intuitive for lower-rated players to understand and execute effectively.
      </Text>

      <Text>
        On the other hand, <span className="text-orange-300 font-semibold">theoretical openings</span> like the Nimzo-Indian
        Defense are much more common at higher levels, since they involve complex moves that may not make any intuitive
        sense to lower ELO players but are theoretically sound.
      </Text>

      <Text>
        Interestingly, <span className="text-orange-300 font-semibold">gambits and irregular openings</span> tend to appear
        either at very high levels and less so at lower levels. This is called a U-Shaped Distribution:
      </Text>

      <div className="ml-6 space-y-2">
        <Text>
          • <span className="text-orange-300">Lower level players</span> are more likely to use gambits casually,
          such as going for Fool&apos;s Mate just to gain ELO, but often ineffectively.
        </Text>
        <Text>
          • <span className="text-orange-300">Mid level players</span> are smarter and want to climb, and thus are
          incentivized to use more standard openings that they have practiced.
        </Text>
        <Text>
          • <span className="text-orange-300">High level players</span> are even smarter and realize that gambits
          can actually be great openings, and thus will use them with much more effectiveness.
        </Text>
      </div>

      <Text>
        <span className="text-orange-300 font-semibold">Purpose:</span> Openings can be played viably at any level,
        it just takes a strong player to use them effectively. Players can use this data to serve as a guideline
        for what kinds of openings they should prepare for, and at what ELO range they should be practicing.
      </Text>

      <Text>
        For example, practicing against Fool&apos;s Mate at 2300 ELO is likely not necessary since you&apos;ve moved past that level.
        Practicing against the Nimzo-Indian is probably not required at 1200 ELO since it&apos;s an opening that other 1200s
        have not perfected - it might be more effective to practice fundamentals instead. However, preparing an opening
        that counters the Caro-Kann might be effective at 600 ELO since lots of black players like that opening at that level.
      </Text>
    </ReportSection>
  );
};

export default OpeningAnalysisSection;