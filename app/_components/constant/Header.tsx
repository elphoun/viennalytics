'use client';
import { cn } from '@/app/utils';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import GraphIcon from '../icons/GraphIcon';
import SearchIcon from '../icons/SearchIcon';

const Header = memo(() => {
  const router = useRouter();

  const handleNavigation = (path: string) => router.push(path);

  const navItems = [
    { label: 'Report', icon: <GraphIcon />, path: '/report' },
    { label: 'Explorer', icon: <SearchIcon />, path: '/explorer' },
  ];

  return (
    <header
      className={cn(
        'flex flex-row items-center justify-between w-full px-5 py-0.5',
        'transition-all duration-700 shadow-xl backdrop-blur-sm shadow-white/5',
        'rounded-2xl md:px-8 bg-white/10'
      )}
    >
      <nav onClick={() => handleNavigation('/')}>
        <img
          src='/viennalytics_banner.svg'
          alt='Viennalytics Logo'
          width={250}
          height={20}
          className='transition-[filter] duration-400 ease-out hover:drop-shadow-[0_0_5px_rgba(251,191,36,0.3)] cursor-pointer'
        />
      </nav>

      <nav className='flex items-center space-x-6'>
        {navItems.map(item => (
          <span
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={cn(
              'flex items-center gap-3 text-md font-semibold transition-all cursor-pointer duration-600 rounded-xl hover:brightness-50'
            )}
          >
            <span className='hidden md:inline-block'>{item.label}</span>
            {item.icon}
          </span>
        ))}
      </nav>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
