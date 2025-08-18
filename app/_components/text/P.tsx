import { cn } from '@/app/utils';
import { memo, PropsWithChildren } from 'react';

type PProps = PropsWithChildren<{ indent?: boolean }>;

const P = memo(({ children, indent = true }: PProps) => (
  <p className={cn("text-base leading-relaxed text-white/75 tracking-wide align-baseline", indent && "indent-6")}>
    {children}
  </p>
));

P.displayName = "P";

export default P;