import { memo } from 'react';

interface DisplayTitleProps {
  text: string;
}

const DisplayTitle = memo(({ text }: DisplayTitleProps) => (
  <span className="text-orange-400 text-4xl font-bold font-sans mb-2">
    {text}
  </span>
));

DisplayTitle.displayName = "DisplayTitle";

export default DisplayTitle;