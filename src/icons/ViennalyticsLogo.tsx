// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

// ─ Interfaces ───────────────────────────────────────────────────────────────────────────────────
interface ViennalyticsLogoProps {
  className?: string;
  size?: number;
}

/**
 * ViennalyticsLogo SVG Component
 * Converted from the original ViennalyticsLogo.svg for better performance
 */
const ViennalyticsLogo = memo(({ className, size = 40 }: ViennalyticsLogoProps) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 1000 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background with pattern */}
      <rect
        width="1000"
        height="1000"
        rx="50"
        fill="url(#chessPattern)"
      />

      {/* Chess pattern overlay */}
      <rect
        x="119"
        y="81"
        width="727"
        height="727"
        fill="url(#chessPatternOverlay)"
      />

      {/* Main logo path - analytics symbol */}
      <path
        d="M874.946 154.689L958.338 421.874C965.718 445.521 953.722 470.354 931.544 477.34C909.366 484.325 885.404 470.819 878.023 447.172L829.383 291.329L670.285 704.214L653.626 747.446L613.06 725.978L278.998 549.177L119.936 868.232C109.212 889.744 83.6816 897.412 62.913 885.36C42.1443 873.309 34.0021 846.1 44.7265 824.589L222.463 468.072L241.14 430.611L278.008 450.123L608.372 624.967L752.716 250.368L647.262 294.605C625.803 303.607 600.895 292.294 591.627 269.339C582.359 246.383 592.241 220.477 613.699 211.476L818.008 125.771L860.375 108L874.946 154.689Z"
        fill="#DAA739"
        fillOpacity="0.9"
      />

      <defs>
        {/* Simplified chess pattern */}
        <pattern
          id="chessPattern"
          patternUnits="userSpaceOnUse"
          width="100"
          height="100"
        >
          <rect width="50" height="50" fill="#312E2B" />
          <rect x="50" width="50" height="50" fill="#BEBDB9" />
          <rect y="50" width="50" height="50" fill="#BEBDB9" />
          <rect x="50" y="50" width="50" height="50" fill="#312E2B" />
        </pattern>

        {/* Overlay pattern */}
        <pattern
          id="chessPatternOverlay"
          patternUnits="userSpaceOnUse"
          width="80"
          height="80"
        >
          <rect width="40" height="40" fill="#2A2825" fillOpacity="0.3" />
          <rect x="40" width="40" height="40" fill="#C5C4C0" fillOpacity="0.3" />
          <rect y="40" width="40" height="40" fill="#C5C4C0" fillOpacity="0.3" />
          <rect x="40" y="40" width="40" height="40" fill="#2A2825" fillOpacity="0.3" />
        </pattern>
      </defs>
    </svg>
));
ViennalyticsLogo.displayName = "ViennalyticsLogo"

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default ViennalyticsLogo;
