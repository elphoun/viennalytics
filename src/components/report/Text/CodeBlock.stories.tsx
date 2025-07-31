import React from 'react';

import { CodeBlock } from './CodeBlock';

export default {
  title: 'Components/CodeBlock',
  component: CodeBlock,
};

export const Basic = () => (
  <CodeBlock>
    <span className="text-cyan-400">console.log</span>(<span className="text-green-400">"Hello, World!"</span>);
  </CodeBlock>
);

export const WithDescription = () => (
  <CodeBlock description="JavaScript example showing a simple console log statement">
    <span className="text-cyan-400">console.log</span>(<span className="text-green-400">"Hello, World!"</span>);
  </CodeBlock>
);

export const WithTitleAndDescription = () => (
  <CodeBlock 
    description="This is a basic JavaScript function example"
    title="Example function:"
  >
    <span className="text-purple-400">function</span> <span className="text-yellow-400">greet</span>(<span className="text-blue-400">name</span>) {"{"}
    <br />
    {"  "}<span className="text-purple-400">return</span> <span className="text-green-400">`Hello, ${"{"}name{"}"}`</span>;
    <br />
    {"}"}
  </CodeBlock>
);

export const ChessExample = () => (
  <CodeBlock 
    description="PGN (Portable Game Notation) → Contains metadata about an individual game"
    title="Example PGN format:"
  >
    <span className="text-purple-400">[Event</span> <span className="text-green-400">"World Championship"</span><span className="text-purple-400">]</span><br />
    <span className="text-purple-400">[White</span> <span className="text-green-400">"Carlsen, Magnus"</span><span className="text-purple-400">]</span><br />
    <span className="text-purple-400">[Black</span> <span className="text-green-400">"Nepomniachtchi, Ian"</span><span className="text-purple-400">]</span><br />
    <span className="text-cyan-400">1.e4 e5 2.Nf3 Nf6</span> <span className="text-yellow-400">1-0</span>
  </CodeBlock>
);