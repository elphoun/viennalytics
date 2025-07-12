import { memo } from 'react';
import { Link } from 'react-router-dom';

import { HeaderBackground } from './Background';
import { ClickProps } from './interfacs';

const CONTENT = {
  logo: {
    alt: 'Viennalytics logo',
  },
  navigation: {
    report: 'Report',
    opening: 'Opening',
  },
}

const HeaderLink = memo(({ icon, label, onClick }: ClickProps) => {
  const getClassName = () => {
    const baseClasses = 'cursor-pointer transition-all duration-300 font-semibold text-sm px-3 py-2 rounded-lg';
    const inactiveClasses = 'text-gray-200 hover:text-amber-400 hover:bg-amber-900/20 hover:shadow-md';
    return `${baseClasses} ${inactiveClasses}`;
  };
  return (
    <button type="button" className={getClassName()} onClick={onClick}>
      {icon}
      {label}
    </button>
  );
});
HeaderLink.displayName = "HeaderLink";

const iconPath = '/ViennalyticsBanner.png';

const Header = memo(() => (
  <HeaderBackground>
    <Link to="/">
      <img
        src={iconPath}
        alt={CONTENT.logo.alt}
        className='max-h-[6vh] w-auto object-contain transition-all duration-300 hover:scale-102 hover:drop-shadow-lg'
      />
    </Link>
    <div className='flex flex-row gap-2'>
      <HeaderLink label={CONTENT.navigation.report} onClick={() => { window.location.href = '/report'; }} />
      <HeaderLink label={CONTENT.navigation.opening} onClick={() => { window.location.href = '/explorer'; }} />
    </div>
  </HeaderBackground>
));
Header.displayName = "Header"

export default Header;