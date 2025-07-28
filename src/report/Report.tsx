// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { useMemo } from "react";

import MainContainer from "../components/containers/MainContainer";
import SectionHeader from "../components/Text/SectionHeadet";
import Subtitle from "../components/Text/Subtitle";
import Text from "../components/Text/Text";
import Title from "../components/Text/Title";
import SearchGlassIcon from "../components/ui/SearchGlassIcon";
import { cn } from "../components/utils";

// Direct imports for optimal performance - no lazy loading
import ChessOpeningClusters from "../components/chart/ChessOpeningClusters";
import EloDistributionByOpening from "../components/chart/EloDistributionByOpening";
import EvalBarDistribution from "../components/chart/EvalBarDistribution";
import OpeningEvalResult from "../components/chart/GameLengthELO";
import MovePairMatchupAnalysis from "../components/chart/MovePairMatchupAnalysis";
import WhiteBlackWinDisparity from "../components/chart/WhiteBlackWinDisparity";

// ─ Constants ────────────────────────────────────────────────────────────────────────────────────
const CONTENT = {
  title: 'Analytics Report',
  intro: {
    main: `Chess is the most celebrated game in history, with new strategies and formats being developed everyday. With over 18 million games being played on chess.com everyday, the game appeals to various skill levels and demographics as both a popular casual pastime to an exciting competitive challenge.`,
    opening: `At the core of each chess game is the opening, the sequence of moves that each player makes from the starting position. Openings serve as the initial “blueprint” of the game, allowing players to take early advantages in the game by controlling the center and increasing opportunities to trap and capture their opponent’s pieces. Taking advantage of openings will allow players to have better positions in the middle and end phases of the game, increasing their chances of winning.`,
    dataset: `This report analyzes a comprehensive dataset of chess games from lichess.org to determine how different openings impact player performance and game outcomes across various skill levels:`
  },
  definitions: [
    { label: "Opening:", desc: "The initial sequence of moves in a chess game, starting from the standard position. Openings are named patterns that help players develop their pieces and control the board early on." },
    { label: "Variation:", desc: "A specific branch or line within a chess opening, representing a different sequence of moves that can arise from the main opening." },
    { label: "ELO:", desc: "A rating system used to calculate the relative skill levels of players in chess. Higher ELO indicates a stronger player." },
    { label: "Evaluation Bar:", desc: "A visual tool used in chess analysis to show which side (white or black) is favored, based on engine evaluation of the position." },
    { label: "Chess Notation:", desc: "A standardized system for recording and describing the moves made during a chess game, typically using algebraic notation (e.g., e4, Nf3)." },
  ],
  sections: [
    {
      title: "Elo Distribution by Opening",
      text: "Distribution of player ratings grouped by chess opening, showing how different openings attract players of varying skill levels.",
    }, {
      title: "White/Black Win Disparity",
      text: "Win rates comparing white vs black across different openings."
    }, {
      title: "Chess Opening Clusters",
      text: "Machine learning analysis grouping chess openings by their win/loss/draw patterns using K-means clustering and PCA visualization."
    }, {
      title: "Chess Evaluation Distribution",
      text: "Distribution of position evaluations after opening sequences are completed."
    }, {
      title: "Game Length vs ELO",
      text: "Correlation between game duration and player skill level."
    }, {
      title: "Move Pair Matchup Analysis",
      text: "Heatmap showing win rates for different first-move combinations."
    }
  ],
  loading: "Loading Data..."
};

// ─ Helper Functions ─────────────────────────────────────────────────────────────────────────────

/** Report component displays the analytics report page with a title, introduction, and description. */
const Report = () => {
  // Memoized dataset statistics
  const datasetStats = useMemo(() => {
    return "Dataset contains comprehensive chess game data from lichess.org with analysis across multiple openings, player ratings, and game outcomes.";
  }, []);

  // Optimized chart wrapper component for consistent responsive behavior
  const ChartWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full overflow-hidden">
      <div className="w-full min-w-0 max-w-full">
        {children}
      </div>
    </div>
  );

  return (
    <MainContainer>
      <div className="w-full max-w-none">
        <Title
          text={CONTENT.title}
          icon={<SearchGlassIcon />}
        />
        
        <div className={cn(
          "flex flex-col text-left bg-orange-100/10 border text-orange-400 border-orange-300/30",
          "p-4 sm:p-6 lg:p-10 rounded-2xl shadow-lg gap-6 lg:gap-10",
          "w-full max-w-full min-w-0 overflow-hidden"
        )}>
          
          {/* Introduction Section */}
          <section className="flex flex-col gap-4 lg:gap-6">
            <Subtitle text="Introduction" />
            <div className="flex flex-col gap-4 lg:gap-6">
              <Text>{CONTENT.intro.main}</Text>
              <Text>{CONTENT.intro.opening}</Text>
              <Text>{CONTENT.intro.dataset}</Text>
            </div>
          </section>

          {/* Definitions Section */}
          <section className="flex flex-col gap-4">
            <Subtitle text="Definitions" />
            <div className="flex flex-col gap-3">
              {CONTENT.definitions.map(({ label, desc }) => (
                <div 
                  className="bg-amber-800/10 ring-2 py-2 px-3 sm:px-4 rounded-2xl break-words" 
                  key={label}
                >
                  <Text>
                    <span className="font-bold text-orange-400">{label}</span> {desc}
                  </Text>
                </div>
              ))}
            </div>
          </section>

          {/* Dataset Overview Section */}
          <section className="flex flex-col gap-4 lg:gap-8">
            <Subtitle text="Dataset Overview" />
            <div className="bg-amber-800/10 ring-2 py-3 px-4 sm:py-4 sm:px-6 rounded-2xl">
              <Text>{datasetStats}</Text>
            </div>
          </section>

          {/* Analysis Section */}
          <section className="flex flex-col gap-6 lg:gap-8">
            <Subtitle text="Analysis" />

            <div className="flex flex-col gap-6 lg:gap-8">
              {/* ELO Distribution Chart */}
              <article className="flex flex-col gap-3 lg:gap-4">
                <SectionHeader text={CONTENT.sections[0].title} />
                <Text>{CONTENT.sections[0].text}</Text>
                <div className="bg-white/5 p-2 sm:p-4 rounded-lg w-full overflow-hidden">
                  <ChartWrapper>
                    <EloDistributionByOpening height={300} />
                  </ChartWrapper>
                </div>
              </article>

              {/* White/Black Win Disparity Chart */}
              <article className="flex flex-col gap-3 lg:gap-4">
                <SectionHeader text={CONTENT.sections[1].title} />
                <Text>{CONTENT.sections[1].text}</Text>
                <div className="bg-white/5 p-2 sm:p-4 rounded-lg w-full overflow-hidden">
                  <ChartWrapper>
                    <WhiteBlackWinDisparity />
                  </ChartWrapper>
                </div>
              </article>

              {/* Chess Opening Clusters Chart */}
              <article className="flex flex-col gap-3 lg:gap-4">
                <SectionHeader text={CONTENT.sections[2].title} />
                <Text>{CONTENT.sections[2].text}</Text>
                <div className="bg-white/5 p-2 sm:p-4 rounded-lg w-full overflow-hidden">
                  <ChartWrapper>
                    <ChessOpeningClusters />
                  </ChartWrapper>
                </div>
              </article>

              {/* Evaluation Distribution Chart */}
              <article className="flex flex-col gap-3 lg:gap-4">
                <SectionHeader text={CONTENT.sections[3].title} />
                <Text>{CONTENT.sections[3].text}</Text>
                <div className="bg-white/5 p-2 sm:p-4 rounded-lg w-full overflow-hidden">
                  <ChartWrapper>
                    <EvalBarDistribution />
                  </ChartWrapper>
                </div>
              </article>

              {/* Move Pair Matchup Analysis Chart */}
              <article className="flex flex-col gap-3 lg:gap-4">
                <SectionHeader text={CONTENT.sections[5].title} />
                <Text>{CONTENT.sections[5].text}</Text>
                <div className="bg-white/5 p-2 sm:p-4 rounded-lg w-full overflow-hidden">
                  <ChartWrapper>
                    <MovePairMatchupAnalysis />
                  </ChartWrapper>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </MainContainer>
  )
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Report; 