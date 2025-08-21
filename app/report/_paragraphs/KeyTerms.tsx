import { memo, ReactNode } from 'react';
import { P } from '@/app/_components';
import DataCard from '@/app/_components/text/DataCard';
import Section from '@/app/_components/text/Section';
import ImageDisplay from '@/app/_components/ui/ImageDisplay';
import Table from '@/app/_components/ui/Table';

interface KeyTerm {
  term: string;
  definition: ReactNode;
  content?: ReactNode;
}

const keyTerms: KeyTerm[] = [
  {
    term: 'Opening',
    definition: (
      <P indent={false}>
        The first phase of the chess game. It starts from the very first move
        and ends at an arbitrary point where the midgame starts.
      </P>
    ),
    content: (
      <ImageDisplay
        src='/vienna.png'
        caption={
          <>
            The Vienna Game
            <br />
            (1. e4 e5 2. c3)
          </>
        }
        width={250}
        height={250}
      />
    ),
  },
  {
    term: 'Defense',
    definition: (
      <P indent={false}>
        Equivalent definition to the opening but from black’s perspective.
        Defenses typically indicate that black chose the decisive move that
        determines which opening is being played in the game. This report will
        refer to both the defense and opening terms as just “openings”, and will
        treat them equally in the analysis.
      </P>
    ),
    content: (
      <ImageDisplay
        src='/caro-kann.png'
        caption={
          <>
            Caro-Kann Defense
            <br />
            (1. e4 c6)
          </>
        }
        width={250}
        height={250}
      />
    ),
  },
  {
    term: 'Variation',
    definition: (
      <P indent={false}>
        A specific branch/deviation in an opening after the core portion has
        been played.
      </P>
    ),
    content: (
      <div className='flex flex-row gap-10'>
        <ImageDisplay
          src='/caro-kann-exchange.png'
          caption={
            <>
              Caro-Kann: Exchange Variation
              <br />
              (1. e4 c6, 2. d4 d5 3.exd5)
            </>
          }
          width={250}
          height={250}
        />
        <ImageDisplay
          src='/caro-kann-advance.png'
          caption={
            <>
              Caro-Kann: Advance Variation
              <br />
              (1. e4 c6 2. d4 d5 3. e5)
            </>
          }
          width={250}
          height={250}
        />
      </div>
    ),
  },
  {
    term: 'ELO',
    definition: (
      <P indent={false}>
        A numerical rating of a chess player’s skill relative to other players.
        Higher ELO indicates a stronger player. The global average ELO is
        approximately <b>600</b> to <b>700</b>.
      </P>
    ),
  },
  {
    term: 'FEN (Forsyth-Edwards Notation)',
    definition: (
      <div className='flex flex-col gap-4'>
        <P indent={false}>
          Used to describe a current chess position using a single line of text.
          It includes:
        </P>
        <Table
          rows={[
            {
              field: 'Board Position',
              value: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR',
            },
            { field: 'Active Color', value: 'b' },
            { field: 'Castling Rights', value: 'KQkq' },
            { field: 'En Passant', value: '-' },
            { field: 'Half-move Clock', value: '1' },
            { field: 'Full-move Number', value: '2' },
          ]}
        />
      </div>
    ),
  },
  {
    term: 'Evaluation',
    definition: (
      <div className='flex flex-col gap-4'>
        <P indent={false}>
          A tool which calculates which side is favored in a match. Positive
          values indicate that white is winning, and negative values indicate
          that black is winning. Evaluations are measured in <b>centipawns</b>{' '}
          (1 pawn = 100 centipawns). Below is a table containing all of the
          conversions for each piece.
        </P>
        <Table
          rows={[
            { field: 'Pawn (♙)', value: '100' },
            { field: 'Knight (♘)', value: '300' },
            { field: 'Bishop (♗)', value: '300' },
            { field: 'Rook (♖)', value: '500' },
            { field: 'Queen (♕)', value: '900' },
            { field: 'King (♔)', value: 'Infinite (Checkmate)' },
          ]}
        />
      </div>
    ),
  },
];

const KeyTermsSection = memo(() => (
  <Section title='Key Terms' icon='📚'>
    <div className='flex flex-col gap-4 '>
      {keyTerms.map(({ term, definition, content }: KeyTerm) => (
        <DataCard key={term} title={term}>
          <div className='text-blue-200'>{definition}</div>
          {content && (
            <div className='flex items-center justify-center'>{content}</div>
          )}
        </DataCard>
      ))}
    </div>
  </Section>
));

KeyTermsSection.displayName = 'KeyTermsSection';

export default KeyTermsSection;
