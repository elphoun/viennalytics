import { memo, ReactNode } from 'react';

interface SubtitleProps {
  text: string;
  icon?: ReactNode;
}

const Subtitle = memo(({ text, icon }: SubtitleProps) => {
  return (
    <div className='text-lg md:text-xl font-medium tracking-wide text-white/80 leading-relaxed mb-3 opacity-90 flex items-center gap-2'>
      {text} {icon}
    </div>
  );
});

Subtitle.displayName = 'Subtitle';

export default Subtitle;
