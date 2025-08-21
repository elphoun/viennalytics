import { memo, ReactNode } from 'react';

interface HyperlinkProps {
  children: ReactNode;
  link: string;
}

const Hyperlink = memo(({ children, link }: HyperlinkProps) => (
  <a
    href={link}
    target='_blank'
    className='underline text-orange-400 align-middle indent-0 inline-block'
    rel='noreferrer'
  >
    {children}
  </a>
));

Hyperlink.displayName = 'Hyperlink';

export default Hyperlink;
