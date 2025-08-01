import { memo } from "react";

import Paragraph from "./Paragraph";
import DataCard from "../../ui/DataCard";
import ReportSection from "../ReportSection";

const pieceTable = [
  { piece: 'Pawn', symbol: '♙', value: '100' },
  { piece: 'Knight', symbol: '♘', value: '300' },
  { piece: 'Bishop', symbol: '♗', value: '300' },
  { piece: 'Rook', symbol: '♖', value: '500' },
  { piece: 'Queen', symbol: '♕', value: '900' },
  { piece: 'King', symbol: '♔', value: '∞' },
];

const keyTerms = [
  {
    term: 'Opening',
    definition: 'The first phase of the chess game, starting from the very first move and ends at an arbitrary point where the midgame starts.'
  }, {
    term: 'Defense',
    definition: 'A defense refers to the moves that black makes to try and counter white’s offense.'
  }, {
    term: 'Variation',
    definition: 'A specific deviation in an opening or defense. Typically named after either the move sequence or someone who pioneered the variant.'
  }, {
    term: 'ELO',
    definition: 'A numerical rating of a chess player’s skill relative to other players. High ELO indicates a stronger player. The global average ELO is approximately 600 to 700.'
  }, {
    term: 'Evaluation',
    definition: 'A tool which calculates which side is favored in a match. Positive values indicate that white is winning, and negative values indicate that black is winning.',
    table: (
      <table className="w-full text-blue-100 text-xs border-separate border-spacing-y-1 mt-2">
        <thead>
          <tr className="text-blue-300">
            <th className="text-left font-bold pb-1">Piece</th>
            <th className="text-left font-bold pb-1">Centipawns (approximate)</th>
          </tr>
        </thead>
        <tbody>
          {pieceTable.map(({ piece, symbol, value }) => (
            <tr key={piece} className="">
              <td className="py-0.5 pr-2 font-semibold flex items-center gap-1">
                <span className="text-lg">{symbol}</span> {piece}
              </td>
              <td className="py-0.5">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  },
];

const KeyTermsSection = memo(() => (
  <ReportSection id="key-terms" title="Key Terms" icon="📚">
    <div className="flex flex-col gap-4">
      {keyTerms.map(({ term, definition, table }) => (
        <DataCard
          key={term}
          title={<span className="text-blue-100 font-bold text-sm tracking-wide drop-shadow-sm">{term}</span>}
          className="bg-gradient-to-br from-gray-950/50 to-gray-900/90 border border-blue-400/30 shadow-md px-2 py-1 rounded-md hover:scale-[1.01] hover:border-blue-300/60 transition-all duration-200 min-h-0"
        >
          <Paragraph className="text-blue-200 text-xs leading-snug font-medium mb-0.5">{definition}</Paragraph>
          {table && <div className="mt-1">{table}</div>}
        </DataCard>
      ))}
    </div>
  </ReportSection>
));

KeyTermsSection.displayName = "KeyTermsSection"

export default KeyTermsSection;
