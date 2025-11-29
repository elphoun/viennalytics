import { memo, ReactElement } from "react";

interface TitleProps {
  text: string;
  icon?: ReactElement;
}

const Title = memo(({ text, icon }: TitleProps) => (
  <h1 className="flex flex-row items-center justify-center gap-4 text-3xl font-bold tracking-tight bg-gradient-to-br from-amber-200 to-white bg-clip-text text-transparent mb-6">
    {text}
    <span className="text-white" aria-hidden="true">
      {icon && icon}
    </span>
  </h1>
));

Title.displayName = "Title";

export default Title;
