/* eslint-disable react/no-unescaped-entities */
import { useEffect } from "react";
import ReportSection from "../ReportSection";
import Paragraph from "../Text/Paragraph";
import Quote from "../Text/Quote";
import SectionHeader from "../Text/SectionHeader";
import Highlight from "../Text/Highlight";
import EloDistributionByOpening from "../chart/EloDistributionByOpening";
import PlaceholderChart from "../../ui/PlaceholderChart";

const OpeningAnalysisSection = () => {
  // Handle chess.com iframe resizing
  useEffect(() => {
    const handleMessage = (ev: MessageEvent) => {
      if (ev.data && ev.data.id === "13652316" && document.getElementById(`${ev.data.id}`)) {
        const element = document.getElementById(`${ev.data.id}`);
        if (element) { element.style.height = `${ev.data.frameHeight}px`; }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [])
  return (
    <ReportSection id="opening-analysis" title="Opening Analysis" icon="♟️">
      <SectionHeader text="Topic 1: ELO Correlating with the Opening" />
      <Quote
        quote="The game of the gods. Infinite possibilities."
        author="Vladimir Nabokov"
        className="mb-6"
      />
      <Paragraph>
        One of the biggest differences between a high and low ranked chess player is their understanding
        of the theoretical possibilities behind each of their moves. Higher ELO players don't just memorize
        their lines; they anticipate their opponents moves and adjust their play accordingly. They understand
        the strategy and potential behind each of the moves and their positional advantages.
      </Paragraph>

      <Paragraph>
        This concept is no different for openings. For example, the Scandinavian is a highly theoretical,
        counter-intuitive opening where black sacrifices a pawn on the first turn to white. Despite this,
        it is an extremely strong opening that counters white's most common e4 opening. Take the following game:
      </Paragraph>

      <div className="flex flex-col md:flex-row-reverse gap-8 w-full h-fit overflow-hidden my-6">
        <div className="flex flex-col md:max-w-1/3 gap-4">
          <Paragraph>
            White opens the game with the standard move e4. Black then responds with d5, seemingly giving up
            the pawn. However, after the two sides trade away their pieces, black is able to gain positional
            advantage by bringing out their light-squared bishop to pin the f3 knight to the queen. This pressures
            the d4 pawn since it is now vulnerable to the Black queen once the knight moves away. Black is then able 
            to carry this momentum to the end of the game with a win by resignation on turn 29, an impressive result for
            this ELO range.
          </Paragraph>
          <Paragraph>
            While these types of openings — known as <Highlight text="Theoretical Openings" color="bg-green-500/20 border-green-950/20" /> 
            rarely follow the player's intuitive understanding of the game, they begin to make sense as players become more accustomed 
            to the importance of positional advantages. This section seeks to analyze these openings in terms of how successful and 
            common they are relative to certain ELO ranges.
          </Paragraph>
        </div>
        <iframe
          id="13652316"
          allowTransparency
          title="13652316"
          className="rounded-2xl scrollbar-thin flex-1 min-h-[350px]"
          style={{ width: '100%', border: 'none', height: 'fit-content' }}
          src="https://www.chess.com/emboard?id=13652316"
        />
      </div>

      <div className="my-8">
        <EloDistributionByOpening />
      </div>

      <div className="mt-10 mb-4">
        <span className="block text-lg font-bold text-orange-600 mb-2">Analysis Results</span>
        <span className="block text-base font-semibold mb-2">Opening Variety</span>
        <Paragraph>
          Most openings have a much higher negative skew (i.e. <Highlight text="-2.063" /> as the min compared to <Highlight text="0.713" />) with positive skews. 
          Additionally, the mean of the elo ranges is typically much higher (with over 171 openings averaging 2700-2799). This means that higher rated players tend to play a wider variety of openings.
          Common openings with more standard moves (e.g. Caro-Kann, Vienna) are more intuitive for lower-rated players.
          On the other hand, theoretical openings like Nimzo Indian are much more common in higher levels, since they involve complex moves that may not make any intuitive sense to lower ELO players. 
        </Paragraph>
      </div>

      <span className="block text-base font-semibold mb-2 mt-8">U-Shaped Distribution</span>
      <Paragraph>
        Interestingly, <span className="text-orange-300 font-semibold">gambits and irregular openings</span> such as the <Highlight text="Halloween Gambit" /> tend to appear at higher frequency at high and low ELOs, while disappearing towards lower ELOs.
        This is called a U-Shaped Distribution. Keep in mind that this is based off <Highlight text="percentage used" />, and not the raw quantity:
      </Paragraph>
      <div className="w-full flex justify-center my-4">
        <img
          src='./U-Shaped.svg'
          alt="U-Shaped Distribution"
          style={{ maxWidth: 420, width: '100%', height: 'auto' }}
        />
      </div>
      <ul className="list-disc ml-8 text-base space-y-1 mb-6">
        <li>
          <span className="text-orange-300 font-semibold">Lower level players</span> are more likely to use gambits casually,
          such as going for Fool's Mate just to gain ELO. These kinds of tactics are usually ineffective since they are either 1. a Gimmick or 2. improperly understood.
        </li>
        <li>
          <span className="text-orange-300 font-semibold">Mid level players</span> have a better grasp of the game and want to climb the ELO ladder.
          They are therefore more incentivized to use more standard openings that they have practiced.
        </li>
        <li>
          <span className="text-orange-300 font-semibold">High level players</span> are even smarter and realize that gambits
          can actually be viable openings, and thus will use them with much more effectiveness.
        </li>
      </ul>

      <Paragraph>
        <span className="text-orange-300 font-semibold">Purpose:</span> The main usage case for this data is to serve as a guideline
        for what kinds of openings you should prepare for, and at what ELO range you should be practicing.
      </Paragraph>

      <div className="mt-4 mb-2">
        <span className="block text-base font-semibold mb-1">Practical Examples</span>
        <ul className="list-disc ml-8 text-base space-y-1">
          <li>
            Practicing against Fool's Mate at <span className="font-semibold">2300 ELO</span> is likely not necessary since players at that level know how to respond and play that opening.
          </li>
          <li>
            Practicing against the Nimzo-Indian is also probably not required at <span className="font-semibold">1200 ELO</span> since it's an opening that other 1200s have not perfected.
          </li>
          <li>
            Preparing an opening that counters the Caro-Kann might be effective at <span className="font-semibold">600 ELO</span> since lots of black players like that opening at that level.
          </li>
        </ul>
      </div>
    </ReportSection>
  );
};

export default OpeningAnalysisSection;