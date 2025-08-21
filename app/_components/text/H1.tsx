import { memo, ReactNode } from 'react';

interface H1Props {
  text: string;
  icon?: ReactNode;
}

const H1 = memo(({ text, icon }: H1Props) => (
  <div className='flex flex-col w-fit'>
    <h1 className='text-2xl font-bold tracking-widest mb-2 flex items-center'>
      {text} | {icon}
    </h1>
    <hr className='text-white max-w-sm md:max-w-none' />
  </div>
));

H1.displayName = 'H1';

export default H1;
