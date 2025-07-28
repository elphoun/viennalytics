// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from 'react';
import { Link } from 'react-router-dom';

import GraphIcon from "../components/background/GraphIcon";
import HeaderLink from "../components/ui/HeaderLink";
import SearchGlassIcon from '../components/ui/SearchGlassIcon';
import { cn } from "../components/utils";

// ─ Constants ────────────────────────────────────────────────────────────────────────────────────

const CONTENT = {
  logo: {
    alt: 'Viennalytics',
  },
  navigation: {
    report: 'Report',
    opening: 'Opening',
  },
}

const iconPath = '/ViennalyticsLogo.svg';

// ─ Helper Functions ─────────────────────────────────────────────────────────────────────────────

/**
 * Header component displays the top navigation bar with logo and navigation links.
 */
const Header = memo(() => (
  <header className={cn("flex flex-row items-center justify-between w-full px-5 py-1 transition-all duration-700 shadow-xl backdrop-blur-sm shadow-white/5 rounded-2xl md:px-8 bg-white/10 hover:scale-101")}> 
    <Link
      to="/"
      className={cn("flex items-center transition-all duration-300 rounded-lg group focus:outline-none focus:ring-2")}
      aria-label="Go to homepage"
    >
      <div className={cn("relative flex flex-row items-center gap-3 ")}> 
        <img
          src={iconPath}
          alt={CONTENT.logo.alt}
          className={cn("h-10 w-auto object-contain transition-all duration-500 ease-out group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(251,191,36,0.3)] group-hover:brightness-110 filter")}
          loading="eager"
          draggable="false"
        />
        <span className={cn('text-xl tracking-wide asul-bold text-amber-400')}>{CONTENT.logo.alt}</span>
      </div>
    </Link>
    <div className={cn('flex flex-row gap-2')}>
      <HeaderLink icon={<SearchGlassIcon />} label={CONTENT.navigation.report} onClick={() => { window.location.href = '/report'; }} />
      <HeaderLink icon={<GraphIcon />} label={CONTENT.navigation.opening} onClick={() => { window.location.href = '/explorer'; }} />
    </div>
  </header>
));
Header.displayName = "Header"

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Header;