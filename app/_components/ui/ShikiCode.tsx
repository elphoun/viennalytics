import React from "react";
import { getHighlighter, type Highlighter, type Lang } from "shiki";

interface CodeBlockProps {
  code: string;
  lang: string;
  className?: string;
}

const CODE_THEME = "dracula";
let cachedHighlighter: Highlighter | null = null;

async function CodeBlock({ code, lang, className = "" }: CodeBlockProps) {
  if (!cachedHighlighter) {
    cachedHighlighter = await getHighlighter({
      themes: [CODE_THEME],
      langs: [lang as Lang],
    });
  }

  const loadedLangs = cachedHighlighter.getLoadedLanguages();
  if (!loadedLangs.includes(lang as Lang)) {
    await cachedHighlighter.loadLanguage(lang as Lang);
  }

  const rawHtml = cachedHighlighter.codeToHtml(code, {
    lang: lang as Lang,
    theme: CODE_THEME,
  });

  const enhancedHtml = rawHtml.replace(
    /<pre([^>]*)class="([^"]*)"/,
    (_match, preAttrs, existingClass) => {
      return `<pre${preAttrs}class="${existingClass} rounded-lg border border-gray-700 p-4 overflow-auto"}`;
    },
  );

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: enhancedHtml }}
    />
  );
}

export default CodeBlock;
