 
interface QuoteProps {
  quote: string;
  author: string;
  className?: string;
}

const Quote = ({ quote, author, className = "" }: QuoteProps) => {
  return (
    <div className={`bg-orange-400/10 border-l-4 border-orange-400 p-4 rounded-r-lg ${className}`}>
      <blockquote className="italic text-orange-300/90 text-lg leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <cite className="block text-orange-400/70 text-sm mt-2 font-medium">
        — {author}
      </cite>
    </div>
  );
};

export default Quote;