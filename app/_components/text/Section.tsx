import { memo, ReactNode } from 'react';
import H1 from './H1';

interface SectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
}

const Section = memo(({ title, icon, children }: SectionProps) => (
  <section className='space-y-6'>
    <H1 text={title} icon={icon} />
    <div className='space-y-7'>{children}</div>
  </section>
));

Section.displayName = 'Section';

export default Section;
