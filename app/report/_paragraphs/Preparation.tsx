import { memo } from 'react';
import { P, GithubInlineIcon } from '@/app/_components';
import Hyperlink from '@/app/_components/text/Hyperlink';
import PromptOnHighlight from '@/app/_components/text/PromptOnHover';
import Section from '@/app/_components/text/Section';
import Highlight from '@/app/_components/text/Highlight';
import Quote from '@/app/_components/text/Quote';
import DataCard from '@/app/_components/text/DataCard';
import ImageDisplay from '@/app/_components/ui/ImageDisplay';
import CodeBlock from '@/app/_components/ui/CodeBlock';

const Preparation = memo(() => (
  <Section title='Preparation' icon='🔬'>
    <P>There are 2 dedicated file types to displaying Chess information:</P>

    <div className='space-y-4'>
      <DataCard title='ECO (Encyclopedia of Chess Openings)'>
        <P>Contains metadata on various openings and their variations</P>
        <CodeBlock
          code={`{
    "code": "B20",
    "name": "Sicilian Defense",
    "moves": "1.e4 c5",
    "variation": "General"
}`}
          lang='json'
        />
      </DataCard>

      <DataCard title='PGN (Portable Game Notation)'>
        <P>
          Contains metadata about an individual game, including its move
          sequence in algebraic notation
        </P>
        <CodeBlock
          code={`[Event "World Championship"]
[White "Carlsen, Magnus"]
[Black "Nepomniachtchi, Ian"]
[Result "1-0"]
[ECO "C42"]

1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4`}
          lang='text'
        />
      </DataCard>
    </div>

    <P>
      Another unique chess tool is a bot known as{' '}
      <Hyperlink link='https://stockfishchess.org/'>Stockfish</Hyperlink>.
      Stockfish is a bot that analyzes a chess position and provides analysis on
      the current evaluation and the best next move. While it is primarily used
      for cheating and giving{' '}
      <PromptOnHighlight
        prompt={
          <Quote
            quote='I rarely play against engines at all, because they just make me feel so stupid and useless.'
            author='Magnus Carlsen (🗿)'
          />
        }
      >
        Magnus Carlsen an inferiority complex
      </PromptOnHighlight>
      , I used it in this project to provide further analysis on the final
      position of the openings.
    </P>

    <ImageDisplay
      src='/stockfish.png'
      caption='Stockfish'
      width={250}
      height={250}
    />

    <P>There are 3 main files I generated for this project:</P>
    <CodeBlock
      code={`→ all_games_info.csv       # Contains the raw extracted data from the PGNs
→ processed_all_games.json # Contains the processed game data from the PGNs  
→ opening_stats.json       # A compilation of all game data. Backend for the opening explorer`}
      lang='text'
    />

    <P>
      There are 6 other files dedicated to each of the graphs (so your poor
      computer and Vercel don’t explode from computing <b>486MB</b>, which is
      how large the <code>processed_all_games.json</code> file is). You can
      checkout the{' '}
      <Hyperlink link='https://github.com/elphoun/viennalytics'>
        <Highlight text='Github' icon={<GithubInlineIcon />} />
      </Hyperlink>{' '}
      to see the code and some specific details behind the design choices of
      this project in the READMEs.
    </P>
  </Section>
));

Preparation.displayName = 'Preparation';

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Preparation;
