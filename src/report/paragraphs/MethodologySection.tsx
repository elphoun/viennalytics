// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
/* eslint-disable react/no-unescaped-entities */
import ReportSection from "../ReportSection";
import CodeBlock from "../Text/CodeBlock";
import Highlight from "../Text/Highlight";
import Hyperlink from "../Text/Hyperlink";
import Paragraph from "../Text/Paragraph";
import PromptOnHighlight from "../Text/PromptOnHighlight";
import Quote from "../Text/Quote";

/**
 * MethodologySection component explains the data sources and methodology used in the chess analysis.
 * Includes code examples and explanations of file formats.
 */
const MethodologySection = () => (
  <ReportSection id="General Methodology" title="General Methodology" icon="🔬">
    <Paragraph className="mb-6">
      There are 2 dedicated file types to displaying Chess information:
    </Paragraph>

    <CodeBlock
      description="ECO (Encyclopedia of Chess Openings) → Contains metadata on various openings and their variations"
      title="Example ECO format:"
    >
      <span className="text-yellow-400">{"{"}</span><br />
      <span className="text-blue-400 ml-3">"code"</span><span className="text-gray-400">:</span> <span className="text-green-400">"B20"</span><span className="text-gray-400">,</span><br />
      <span className="text-blue-400 ml-3">"name"</span><span className="text-gray-400">:</span> <span className="text-green-400">"Sicilian Defense"</span><span className="text-gray-400">,</span><br />
      <span className="text-blue-400 ml-3">"moves"</span><span className="text-gray-400">:</span> <span className="text-green-400">"1.e4 c5"</span><span className="text-gray-400">,</span><br />
      <span className="text-blue-400 ml-3">"variation"</span><span className="text-gray-400">:</span> <span className="text-green-400">"General"</span><br />
      <span className="text-yellow-400">{"}"}</span>
    </CodeBlock>

    <div className="my-6">
      <CodeBlock
        description="PGN (Portable Game Notation) → Contains metadata about an individual game, including its move sequence in algebraic notation"
        title="Example PGN format:"
      >
        <span className="text-purple-400">[Event</span> <span className="text-green-400">"World Championship"</span><span className="text-purple-400">]</span><br />
        <span className="text-purple-400">[White</span> <span className="text-green-400">"Carlsen, Magnus"</span><span className="text-purple-400">]</span><br />
        <span className="text-purple-400">[Black</span> <span className="text-green-400">"Nepomniachtchi, Ian"</span><span className="text-purple-400">]</span><br />
        <span className="text-purple-400">[Result</span> <span className="text-green-400">&quot;1-0&quot;</span><span className="text-purple-400">]</span><br />
        <span className="text-purple-400">[ECO</span> <span className="text-green-400">&quot;C42&quot;</span><span className="text-purple-400">]</span><br />
        <span className="text-gray-500">...</span><span className="text-cyan-400">1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4</span>
      </CodeBlock>

      <Paragraph>
        Another unique chess tool is a bot known as{' '}
        <Hyperlink link="https://stockfishchess.org/">
          <Highlight
            color="bg-orange-400/20 text-orange-300 border-orange-400/30"
            text="Stockfish"
            icon={<span role="img" aria-label="fish">🐟</span>}
          />
        </Hyperlink>.
        Stockfish is a bot that analyzes a chess position and provides analysis on the current evaluation and the best next move.
        While it is primarily used for cheating and giving{' '}
        <PromptOnHighlight
          prompt={
            <Quote
              quote="I rarely play against engines at all, because they just make me feel so stupid and useless."
              author="Magnus Carlsen"
            />
          }
        >
          Magnus Carlsen an inferiority complex
        </PromptOnHighlight>,
        I used it in this project to provide further analysis on the final position of the openings.
      </Paragraph>

      <Paragraph className="my-6">
        There are 3 main files I generated for this project:
      </Paragraph>

      <CodeBlock className="mb-6 text-gray-900">
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">→</span>
          <span>all_games_info.csv → CSV containing processed PGN data</span>
        </div>
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">→</span>
          <span>processed_all_games.json → JSON containing individual game data</span>
        </div>
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-2">→</span>
          <span>opening_stats.json → JSON containing compiled opening statistics</span>
        </div>
      </CodeBlock>

      <Paragraph>
        There are also a couple of files I used to generate graph specific information (so your poor computer doesn't explode reading this).
        You can checkout the{' '}
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
        </Hyperlink>{' '}
        in the main page to see the code and some specific details behind the design choices of this project.
        All of this data (and the website) is hosted on Vercel with all of the data stored in blob storage.
      </Paragraph>
    </div>
  </ReportSection>
);


// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default MethodologySection;