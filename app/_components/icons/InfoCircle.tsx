import { memo, ReactElement } from 'react';

const InfoCircle = memo(
  ({ title }: { title: string }): ReactElement => (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      xmlns='http://www.w3.org/2000/svg'
      className='absolute top-1/2 -translate-y-1/2 right-1.5 cursor-help w-3.5 h-3.5 text-gray-400 hover:text-amber-400 transition-colors flex-shrink-0'
    >
      {title && <title>{title}</title>}
      <circle cx='12' cy='12' r='10' fill='currentColor' />
      <path
        d='M12 16v-4m0-4h.01'
        stroke='white'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
      />
    </svg>
  )
);

export default InfoCircle;
