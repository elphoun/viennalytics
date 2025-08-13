// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import ImageDisplay from "../../ui/ImageDisplay";
import ReportSection from "../ReportSection";
import Highlight from "../Text/Highlight";
import Paragraph from "../Text/Paragraph";
import PromptOnHighlight from "../Text/PromptOnHighlight";
import WhiteBlackWinDisparity from "../chart/WhiteBlackWinDisparity";
import ChessOpeningClusters from "../chart/ChessOpeningClusters";
import OpeningEvalBoxPlot from "../chart/OpeningEvalBoxPlot";
import MovePairMatchupAnalysis from "../chart/MovePairMatchupAnalysis";

/**
 * MovePairAnalysis component analyzes chess move pairs and opening matchups.
 * Includes historical context and modern chess principles.
 */
const MovePairAnalysis = memo(() => (
  <ReportSection id="" title="Analysis of Move Pairs and Opening Matchups" icon="📋">
    <Paragraph className="mb-6">
      In 1561, Ruy Lopez published the book{' '}
      <PromptOnHighlight prompt="Translated: The Art of the Game of Chess">
        Libro de la invención liberal y arte del juego del axedrez.
      </PromptOnHighlight>
      His book discussed the basics of openings and development, as well as introducing to the chess world the importance of central control.
      His work has led to his own opening that capitalizes on the very concepts that he pushed for.
    </Paragraph>

    <div className="flex flex-row gap-5 w-full items-center justify-center">
      <ImageDisplay
        src="./artofchess.jpg"
        caption="Libro de la invención liberal y arte del juego del axedrez"
        imageClassName="max-h-60 object-contain"
      />
      <ImageDisplay
        src="./ruylopez.png"
        caption={<>
          Ruy Lopez (Spanish Game)
          <br />
          1.e4 e5 2.Nf3 Nc6 3.Bb5
        </>}
        imageClassName="max-h-60 object-contain"
      />
    </div>

    <Paragraph className="mt-6">
      In the modern chess world, these principles have been developed into what are known as the chess principles.
      A few key ones that will be discussed in this article are{' '}
      <Highlight text="Controlling the Center" color="bg-orange-400/20 text-orange-300 border-orange-400/30" />, <Highlight text="A knight on the rim is dim" color="bg-orange-400/20 text-orange-300 border-orange-400/30" />, and{' '}
      <Highlight text="Develop Pieces Early" color="bg-orange-400/20 text-orange-300 border-orange-400/30" />.
      These principles will be used to analyze how different openings and their leading moves lead to different outcomes within games.
    </Paragraph>

    <ChessOpeningClusters />
    <OpeningEvalBoxPlot />
    <MovePairMatchupAnalysis />

  </ReportSection>
));
MovePairAnalysis.displayName = "MovePairAnalysis";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default MovePairAnalysis;