import { RefObject } from "react";
import { CodeBlock } from "../../components/CodeBlock";
import { ImageDisplay } from "../../components/ImageDisplay";
import ReportSection from "../../components/report/ReportSection";
import Quote from "../../components/report/Text/Quote";
import Text from "../../components/Text/Text";

interface MethodologySectionProps {
  sectionRefs: RefObject<Record<string, HTMLElement | null>>;
}

const MethodologySection = ({ sectionRefs }: MethodologySectionProps) => {
  return (
    <ReportSection id="General Methodology" title="General Methodology" icon="🔬" sectionRef={sectionRefs}>
      <Text>
        There are 2 types of files dedicated to displaying Chess information:
      </Text>

      <CodeBlock
        description="ECO (Encyclopedia of Chess Openings) → Contains metadata on various openings and their variations"
        title="Example:"
      >
        <span className="text-yellow-400">{"{"}</span><br />
        <span className="text-blue-400 ml-3">"code"</span><span className="text-gray-400">:</span> <span className="text-green-400">"B20"</span><span className="text-gray-400">,</span><br />
        <span className="text-blue-400 ml-3">"name"</span><span className="text-gray-400">:</span> <span className="text-green-400">"Sicilian Defense"</span><span className="text-gray-400">,</span><br />
        <span className="text-blue-400 ml-3">"moves"</span><span className="text-gray-400">:</span> <span className="text-green-400">"1.e4 c5"</span><span className="text-gray-400">,</span><br />
        <span className="text-blue-400 ml-3">"variation"</span><span className="text-gray-400">:</span> <span className="text-green-400">"General"</span><br />
        <span className="text-yellow-400">{"}"}</span>
      </CodeBlock>

      <CodeBlock
        description="PGN (Portable Game Notation) → Contains metadata about an individual game, including its move sequence in algebraic notation"
        title="Example PGN format:"
      >
        <span className="text-purple-400">[Event</span> <span className="text-green-400">"World Championship"</span><span className="text-purple-400">]</span><br />
        <span className="text-purple-400">[White</span> <span className="text-green-400">"Carlsen, Magnus"</span><span className="text-purple-400">]</span><br />
        <span className="text-purple-400">[Black</span> <span className="text-green-400">"Nepomniachtchi, Ian"</span><span className="text-purple-400">]</span><br />
        <span className="text-purple-400">[Result</span> <span className="text-green-400">&quot;1-0&quot;</span><span className="text-purple-400">]</span><br />
        <span className="text-purple-400">[ECO</span> <span className="text-green-400">&quot;C42&quot;</span><span className="text-purple-400">]</span><br />
        <span className="text-gray-500">...</span>

        <span className="text-cyan-400">1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4</span> <span className="text-yellow-400">1-0</span>
      </CodeBlock>

      <Text>
        Another unique chess tool is a bot known as stockfish.
        Stockfish is a bot that analyzes a chess position and provides analysis on the current evaluation and the best next move.
        While it is primarily used for cheating and giving Magnus Carlsen an inferiority complex,
        I used it in this project to provide further analysis on the final position of the openings.
      </Text>

      <Quote
        quote="I rarely play against engines at all, because they just make me feel so stupid and useless."
        author="Magnus Carlsen"
      />

      <Text>
        There are 9 main different files I generated for this project.
      </Text>
      <CodeBlock className="mt-4 bg-gray-100 text-gray-900">
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">→</span>
          <span className="text-green-300">all_games_info.csv</span>
        </div>
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">→</span>
          <span>opening_stats.json</span>
        </div>
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">→</span>
          <span>processed_all_games.json</span>
        </div>
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">→</span>
          <span>datasetSummary.json</span>
        </div>
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">→</span>
          <span>heatmapMatchup.json</span>
        </div>
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">→</span>
          <span>openingELO.json</span>
        </div>
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">→</span>
          <span>openingEvalDistribution.json</span>
        </div>
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">→</span>
          <span>openingUsageByELO.json</span>
        </div>
        <div className="flex items-center">
          <span className="text-blue-600 mr-2">→</span>
          <span>openingWinrates.json</span>
        </div>
      </CodeBlock>

      <Text>
        There are also a couple of files I used to generate graph specific information (so your poor computer doesn't explode reading this). You can checkout the github in the main page to see the code and some specific details behind the design choices of this project.

        All of this data (and the website) is hosted on Vercel with all of the data stored in blob storage.
      </Text>

      <ImageDisplay src="./time_taken.png" alt="" caption="My God That Took a Long Time" />
    </ReportSection>
  );
};

export default MethodologySection;