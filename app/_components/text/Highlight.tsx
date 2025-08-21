import { memo, ReactElement, ReactNode } from 'react';

import { cn } from '../../utils';

interface HighlightProps {
  text: string;
  icon?: ReactNode;
}

const Highlight = memo(
  ({ text, icon }: HighlightProps): ReactElement => (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-2 leading-none indent-0 rounded-md font-semibold text-sm bg-orange-400/20 text-orange-300 border border-orange-400/30 px-1 py-0.5 shadow-sm mb-0 align-middle'
      )}
    >
      {icon && (
        <span className='inline-flex items-center align-middle'>{icon}</span>
      )}
      <span className='leading-none align-middle'>{text}</span>
    </span>
  )
);

Highlight.displayName = 'Highlight';

export default Highlight;
