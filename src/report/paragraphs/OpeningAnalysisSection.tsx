// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
/* eslint-disable react/no-unescaped-entities */
import { useEffect } from "react";

import ImageDisplay from "../../ui/ImageDisplay";
import EloDistributionByOpening from "../chart/EloDistributionByOpening";
import "../chart/MovePairMatchupAnalysis";
import ReportSection from "../ReportSection";
import { CodeBlock, Hyperlink, PromptOnHighlight } from "../Text";
import Highlight from "../Text/Highlight";
import Paragraph from "../Text/Paragraph";
import Quote from "../Text/Quote";
import H4 from "../Text/H4";

/**
 * OpeningAnalysisSection component displays analysis of chess openings and their correlation with ELO ratings.
 * Includes interactive chess board and statistical analysis.
 */
const OpeningAnalysisSection = () => {
  // Handle chess.com iframe resizing
  useEffect(() => {
    const handleMessage = (ev: MessageEvent) => {
      if (ev.data && ev.data.id === "13652316" && document.getElementById(`${ev.data.id}`)) {
        const element = document.getElementById(`${ev.data.id}`);
        if (element) {
          element.style.height = `${ev.data.frameHeight}px`;
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <ReportSection id="opening-analysis" title="Opening Analysis" icon="♟️">
      <H4 text="Topic 1: ELO Correlating with the Opening" />

      <Quote
        quote="The game of the gods. Infinite possibilities."
        author="Vladimir Nabokov"
      />

      <Paragraph>
        One of the biggest differences between a high and low ranked chess player is how well they can understand the theoretical possibilities behind their moves. Higher ELO players don’t just memorize their lines; they anticipate their opponents moves and adjust their play accordingly. They understand the strategy and potential behind each of the moves and their positional advantages.
      </Paragraph>

      <Paragraph>
        This concept is no different for openings. For example, the
        <Hyperlink link="https://www.chess.com/openings/Scandinavian-Defense">
          Scandinavian
        </Hyperlink>
        is a theoretical, counter-intuitive opening where black sacrifices a pawn on the first turn to white. Despite this, it is an extremely strong opening that counters white’s most common e4 opening. Take game 2 from the following blog:

      </Paragraph>

      <div className="flex flex-col md:flex-row-reverse gap-4 w-full h-fit overflow-hidden">
        <div className="flex flex-col md:max-w-1/3 gap-4">
          <Paragraph>
            White opens the game with the standard move e4. Black then responds with d5, seemingly giving up their pawn.
            However, black is able to gain positional advantage since after the two sides trade away their piece, they can bring out their light-squared bishop to pin the f3 knight to the queen.
            This pressures the d4 pawn since their d4 pawn is now vulnerable to the black queen once the f3 knight moves away.
            Taking advantage of this situation, black is able to end the game with a win by resignation on turn 29.
          </Paragraph>

          <Paragraph>
            While these types of openings — known as <Highlight text="Theoretical Openings" color="bg-orange-400/20 text-orange-300 border-orange-400/30" />
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

      <EloDistributionByOpening maxOpenings={8} />

      <span className="block text-lg font-bold text-orange-600">Methodology</span>
      <Paragraph>
        After compiling each of the games, I extracted the <Highlight text="elo" /> and the <Highlight text="name of the opening" /> from each of the games to minimize the amount of space that it would take to store this data.
      </Paragraph>
      <CodeBlock>
        <>
          <span className="text-yellow-400">[</span>
          <br />
          <span className="ml-4">
            <span className="text-yellow-400">{"{"}</span>
          </span>
          <br />
          <span className="ml-8">
            <span className="text-blue-300">"elo"</span>
            <span className="text-white">: </span>
            <span className="text-green-400">1200</span>
            <span className="text-white">, </span>
            <span className="text-blue-300">"opening"</span>
            <span className="text-white">: </span>
            <span className="text-orange-300">"Italian Game"</span>
          </span>
          <br />
          <span className="ml-4">
            <span className="text-yellow-400">{"}"}</span>
            <span className="text-white">,</span>
          </span>
          <span className="ml-2 text-gray-400">...</span>
          <br />
          <span className="text-yellow-400">]</span>
        </>
      </CodeBlock>
      <Paragraph>
        I then determined the skew, mean, and median of each opening, as well as the dataset as a whole.
        The code and data for all of this information can be found on the
        <Hyperlink link="https://github.com/elphoun/viennalytics">
          <Highlight
            color="bg-gray-700/30 text-white border-gray-600/40"
            text="Github"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 inline-block align-text-bottom">
                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.577.688.48C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2z" />
              </svg>
            }
          />
        </Hyperlink>.
      </Paragraph>

      <span className="block text-lg font-bold text-orange-600">Analysis Results</span>
      <span className="block text-base font-semibold">Opening Variety</span>
      <Paragraph>
        The average and median ELO range of all of the datasets was typically around <Highlight text="2000-2099" /> , with the highest <PromptOnHighlight prompt="mode of the dataset">frequency</PromptOnHighlight> of games being played at the
        <Highlight text="1900-1999" /> range. This indicates an <Highlight text="approximately symmetrical" /> distribution, since the mean, median, and mode are around the same ELO range and the overall skew is <Highlight text="-0.131" />
      </Paragraph>
      <Paragraph>
        However, this data does not account for the number of games played in each ELO range. When looking at individual games, the maximum skew for positively distributed openings (<Highlight text="0.9539" /> for the <Highlight text="Canard Opening" />)
        is much lower than the maximum skew for negatively distributed openings (<Highlight text="-1.3853" /> for the <Highlight text="Two Knights Opening" />), with the overall median skew of the dataset as <Highlight text="-0.0657" />.
        Since the median and the skew for the negatively distributed openings are both negative, it indicates that while there were more negatively skewed openings,
        the number of the players per positively distributed openings at lower ELO’s meant that the overall distribution of the dataset was approximately symmetrical.
      </Paragraph>
      <Paragraph>
        Openings with more standard moves like the Italian Game were played more at lower ELO ranges (averaging <Highlight text="1900" /> with a minimum of <Highlight text="750" />) while harder,
        more theoretical openings like the Nimzo-Indian Defense were played far more at higher levels (averaging <Highlight text="2200" /> with a minimum of <Highlight text="1150" />).
        What this indicates is that people are likely to play the same types of openings at lower ELOs before slowly transitioning out into more theoretical openings as they improve.
        Higher ELO players are also only likely to play openings that are either highly theoretical or consistent, hence why certain openings like the Two Knights Opening are an exception to this rule:
        simple yet played more effectively at a high level.
      </Paragraph>

      <span className="block text-base font-semibold mb-4 mt-8">Gambits and Irregular Openings</span>
      <Paragraph>
        Interestingly, <span className="text-orange-300 font-semibold">gambits and irregular openings</span> tend to appear either at a very high level and less so at lower levels.
        This is known as a <Highlight text="U-Shaped Distribution" /> , and is used to describe scenarios where the peaks of a dataset occur at the beginning and the end of the distribution while dipping in the middle.
        Mathematically, these can be determined by a negative <Highlight text="kurtosis" /> value, which represents how arched the distribution is.
      </Paragraph>

      <ImageDisplay
        src="./U-Shaped.svg"
        caption="U-Shaped Distribution"
        className="max-w-50"
      />

      <Paragraph>
        A prominent example of this is the <Highlight text="Danish Gambit Declined" /> opening which has a kurtosis value of <Highlight text="-1.23" /> . While it features relatively simple opening moves, it leads into a weaker
        <Hyperlink link="https://www.chess.com/terms/pawn-structure">pawn structure</Hyperlink> due to the doubled pawns in the <Highlight text="d file" />.
      </Paragraph>

      <ImageDisplay
        src="./danish-gambit-declined.png"
        caption="Danish Gambit Declined"
        className="max-w-50"
      />

      <Paragraph>
        This illustrates a broad trend with how different skill levels approach these types of openings
        <ul className="list-disc ml-8 text-base space-y-2 mb-6 text-white">
          <li>
            <span className="text-orange-300 font-semibold">Lower level players</span> likely play this without recognizing the harm of doubled pawns. As a result they have a higher density due to their lack of ability to play other openings
          </li>
          <li>
            <span className="text-orange-300 font-semibold">Mid level players</span> are typically more aware of doubled pawns, and will therefore avoid this opening as much as possible.
          </li>
          <li>
            <span className="text-orange-300 font-semibold">High level players</span> are aware of doubled pawns, but are willing to break their principles if they recognize some kind of benefit that results from this particular opening. 
          </li>
        </ul>
      </Paragraph>
    </ReportSection>
  );
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default OpeningAnalysisSection;