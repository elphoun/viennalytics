import { ReactElement } from "react";

import { cn } from "../../utils";

interface HighlightProps {
  color?: string;
  text: string;
  icon?: ReactElement;
}

const Highlight = ({ color, text, icon }: HighlightProps): ReactElement => (
  <>
    {' '}
  <span
    className={cn('inline-flex text-center px-1 rounded font-semibold text-sm indent-0 border-1', color)}
  >
    {icon && <span className="mr-1 flex items-center">{icon}</span>}
    {text}
  </span>
  </>
);

export default Highlight;