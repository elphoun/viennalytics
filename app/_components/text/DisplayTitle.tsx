import { memo } from "react";

interface DisplayTitleProps {
  text: string;
}

const DisplayTitle = memo(({ text }: DisplayTitleProps) => (
  <h1
    className="text-orange-400 text-6xl font-bold font-sans mb-4"
    role="heading"
    aria-level={1}
  >
    {text}
  </h1>
));

DisplayTitle.displayName = "DisplayTitle";

export default DisplayTitle;
