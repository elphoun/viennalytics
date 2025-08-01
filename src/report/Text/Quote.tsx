 
interface QuoteProps {
  quote: string;
  author: string;
  className?: string;
}

const Quote = ({ quote, author, className = "" }: QuoteProps) => {
  return (
    <div className={`bg-green-100 border-l-4 border-green-400 p-2 rounded-r-lg max-w-sm ${className}`}>
      <blockquote className="italic text-green-700/90 text-sm leading-relaxed break-words whitespace-normal">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <cite className="block text-green-600/70 text-xs mt-2">
        — {author}
      </cite>
    </div>
  );
};

export default Quote;