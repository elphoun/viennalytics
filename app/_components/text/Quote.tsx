import { memo } from 'react';

interface QuoteProps {
  quote: string;
  author: string;
  className?: string;
  inline?: boolean;
}

const Quote = memo(
  ({ quote, author, className = '', inline = false }: QuoteProps) => {
    if (inline) {
      // Inline-friendly rendering (safe to place inside <p>)
      return (
        <q
          className={`italic text-white/95 text-base font-light tracking-wide ${className}`}
        >
          "{quote}"{' '}
          <span className='ml-2 text-orange-300/90 text-sm'>— {author}</span>
        </q>
      );
    }

    return (
      <blockquote
        className={`relative p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border-l-4 border-orange-400/60 backdrop-blur-sm ${className}`}
      >
        <div className='relative'>
          <svg
            className='absolute -top-2 -left-2 w-8 h-8 text-orange-400/30'
            fill='currentColor'
            viewBox='0 0 32 32'
          >
            <path d='M10 8c-3.3 0-6 2.7-6 6v10h10V14h-4c0-2.2 1.8-4 4-4V8zm12 0c-3.3 0-6 2.7-6 6v10h10V14h-4c0-2.2 1.8-4 4-4V8z' />
          </svg>
          <p className='relative italic text-white/95 text-base leading-relaxed font-light tracking-wide mb-4 pl-6'>
            "{quote}"
          </p>
          <cite className='block text-right text-orange-300/90 text-sm font-medium tracking-wider'>
            — {author}
          </cite>
        </div>
      </blockquote>
    );
  }
);

Quote.displayName = 'Quote';

export default Quote;
