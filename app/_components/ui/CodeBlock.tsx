import React from 'react';
import { getHighlighter, type Highlighter } from 'shiki';

interface CodeBlockProps {
  code: string;
  lang: string;
  className?: string;
}

const CODE_THEME = 'dracula';
let cachedHighlighter: Highlighter | null = null;

export default async function CodeBlock({
  code,
  lang,
  className = '',
}: CodeBlockProps) {
  if (!cachedHighlighter) {
    cachedHighlighter = await getHighlighter({
      themes: [CODE_THEME],
      langs: ['json', 'tex'],
    });
  }

  const rawHtml = cachedHighlighter.codeToHtml(code, {
    lang,
    theme: CODE_THEME,
  });

  // Inject padding, shadow, border and styling directly into the Shiki-generated <pre> element
  const enhancedHtml =
    rawHtml.replace(
      /<pre([^>]*style="[^"]*")([^>]*)>/,
      (_match, styleAttr, otherAttrs) => {
        const updatedStyle = styleAttr.replace(
          'style="',
          'style="padding: 1rem; border-radius: 0.5rem; box-shadow: 0 0px 25px -5px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.3); border: 4px solid rgba(255, 255, 255, 0.1); '
        );
        return `<pre${updatedStyle}${otherAttrs}>`;
      }
    ) ||
    rawHtml.replace(
      /<pre([^>]*)>/,
      `<pre$1 style="padding: 1rem; border-radius: 0.5rem; box-shadow: 0 0px 25px -5px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.3); border: 4px solid rgba(255, 255, 255, 0.1);">`
    );

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: enhancedHtml }}
    />
  );
}
