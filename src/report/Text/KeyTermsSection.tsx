// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo, ReactNode } from "react";

import Paragraph from "./Paragraph";
import DataCard from "../../ui/DataCard";
import ImageDisplay from "../../ui/ImageDisplay";
import Table from "../../ui/Table";
import ReportSection from "../ReportSection";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface KeyTerm {
  term: string;
  definition: ReactNode;
  content?: ReactNode;
}

// ─ Constants ────────────────────────────────────────────────────────────────────────────────────
const keyTerms: KeyTerm[] = [
  {
    term: "Opening",
    definition: (
      <Paragraph>
        The first phase of the chess game. It starts from the very first move and ends at an arbitrary point where the general <b>book move</b> ends and the diverging midgame starts.
      </Paragraph>
    ),
    content: (
      <ImageDisplay
        src="./vienna.png"
        caption={
          <>
            The Vienna Game
            <br />
            (1. e4 e5 2. c3)
          </>
        }
        className="max-w-50"
      />
    ),
  },
  {
    term: "Defense",
    definition: (
      <Paragraph>
        Equivalent to the opening but from black’s perspective and typically indicates that black made the “commanding move”. For the purposes of this report these terms will be grouped as just “openings”.
      </Paragraph>
    ),
    content: (
      <ImageDisplay
        src="./caro-kann.png"
        caption={
          <>
            Caro-Kann Defense
            <br />
            (1. e4 c6)
          </>
        }
        className="max-w-50"
      />
    ),
  },
  {
    term: "Variation",
    definition: (
      <Paragraph>
        A specific branch/deviation in an opening after the core portion has been played.
      </Paragraph>
    ),
    content: (
      <div className="flex flex-row gap-10">
        <ImageDisplay
          src="./caro-kann-exchange.png"
          caption={
            <>
              Caro-Kann: Exchange Variation
              <br />
              (1. e4 c6, 2. d4 d5 3.exd5)
            </>
          }
          className="max-w-50"
        />
        <ImageDisplay
          src="./caro-kann-advance.png"
          caption={
            <>
              Caro-Kann: Advance Variation
              <br />
              (1. e4 c6 2. d4 d5 3. e5)
            </>
          }
          className="max-w-50"
        />
      </div>
    ),
  },
  {
    term: "ELO",
    definition: (
      <Paragraph>
        A numerical rating of a chess player’s skill relative to other players. Higher ELO indicates a stronger player. The global average ELO is approximately <b>600</b> to <b>700</b>.
      </Paragraph>
    ),
  }, {
    term: "FEN (Forsyth-Edwards Notation)",
    definition: (
      <div className="flex flex-col gap-4">
        <Paragraph>
          Used to describe a current chess position using a single line of text. It includes:
        </Paragraph>
        <Table
          rows={[
            { field: "Board Position", value: "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR" },
            { field: "Active Color", value: "b" },
            { field: "Castling Rights", value: "KQkq" },
            { field: "En Passant", value: "-" },
            { field: "Half-move Clock", value: "1" },
            { field: "Full-move Number", value: "2" }
          ]}
        />
      </div>
    )
  }, {
    term: "Evaluation",
    definition: (
      <div className="flex flex-col gap-4">
        <Paragraph>
        A tool which calculates which side is favored in a match. Positive values indicate that white is winning, and negative values indicate that black is winning. 
        Evaluations are measured in <b>centipawns</b> (1 pawn = 100 centipawns). Below is a table containing all of the conversions for each piece. 
        </Paragraph>
        <Table
          rows={[
            { field: "Pawn (♙)", value: "100" },
            { field: "Knight (♘)", value: "300" },
            { field: "Bishop (♗)", value: "300" },
            { field: "Rook (♖)", value: "500" },
            { field: "Queen (♕)", value: "900" },
            { field: "King (♔)", value: "Infinite (Checkmate)" }
          ]}
        />
      </div>
    )
  }
];

/**
 * KeyTermsSection component displays a section with chess terminology definitions.
 * Includes a table of piece values for reference.
 */
const KeyTermsSection = memo(() => (
  <ReportSection id="key-terms" title="Key Terms" icon="📚">
    <div className="flex flex-col gap-4 ">
      {keyTerms.map(({ term, definition, content }: KeyTerm) => (
        <DataCard
          key={term}
          title={<span className="text-blue-100 font-bold tracking-wide drop-shadow-sm">{term}</span>}
          className="bg-gradient-to-br from-gray-950/50 to-gray-900/90 border border-blue-400/30 hover:scale-[1.01] hover:border-blue-300/60 min-h-fit flex-1"
        >
          <div className="text-blue-200">{definition}</div>
          {content && <div className="mt-4 flex items-center justify-center">{content}</div>}
        </DataCard>
      ))}
    </div>
  </ReportSection>
));
KeyTermsSection.displayName = "KeyTermsSection";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default KeyTermsSection;