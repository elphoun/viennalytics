// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { cn } from "../../utils";

// Import CSS animations
import "./beam-animations.css";

// ─ Interfaces ───────────────────────────────────────────────────────────────────────────────────
interface BackgroundBeamsProps {
  className?: string;
}

const BackgroundBeams = memo(({ className }: BackgroundBeamsProps) => {
    // Reduced to 8 paths instead of 50 for better performance
    const paths = [
      "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
      "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
      "M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811",
      "M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779",
      "M-268 -317C-268 -317 -200 88 264 215C728 342 796 747 796 747",
      "M-240 -349C-240 -349 -172 56 292 183C756 310 824 715 824 715",
      "M-212 -381C-212 -381 -144 24 320 151C784 278 852 683 852 683",
      "M-184 -413C-184 -413 -116 -8 348 119C812 246 880 651 880 651",
    ];

    return (
      <div
        className={cn(
          "fixed inset-0 flex h-screen w-screen items-center justify-center bg-neutral-950 [mask-repeat:no-repeat] [mask-size:40px] z-1",
          className
        )}
      >
        <svg
          className="absolute z-0 w-screen h-screen pointer-events-none"
          width="100%"
          height="100%"
          viewBox="0 0 696 316"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Static background path for foundation */}
          <path
            d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859"
            stroke="url(#paint0_radial_242_278)"
            strokeOpacity="0.05"
            strokeWidth="0.5"
          />

          {/* Animated beam paths using CSS animations */}
          {paths.map((path, index) => (
            <path
              key={`beam-${path.slice(5, 15)}`}
              d={path}
              stroke={`url(#linearGradient-${index % 3})`}
              strokeWidth="0.5"
              className="beam-path"
              style={{
                animationDelay: `${index * 0.8}s`,
                animationDuration: `${6 + (index % 3) * 2}s`
              }}
            />
          ))}

          <defs>
            {/* Simplified gradients without motion */}
            <linearGradient
              id="linearGradient-0"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop offset="25%" stopColor="#18CCFC" />
              <stop offset="75%" stopColor="#6344F5" />
              <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
            </linearGradient>

            <linearGradient
              id="linearGradient-1"
              x1="0%"
              y1="0%"
              x2="95%"
              y2="95%"
            >
              <stop stopColor="#6344F5" stopOpacity="0" />
              <stop offset="30%" stopColor="#6344F5" />
              <stop offset="70%" stopColor="#AE48FF" />
              <stop offset="100%" stopColor="#18CCFC" stopOpacity="0" />
            </linearGradient>

            <linearGradient
              id="linearGradient-2"
              x1="0%"
              y1="0%"
              x2="90%"
              y2="90%"
            >
              <stop stopColor="#AE48FF" stopOpacity="0" />
              <stop offset="20%" stopColor="#AE48FF" />
              <stop offset="80%" stopColor="#18CCFC" />
              <stop offset="100%" stopColor="#6344F5" stopOpacity="0" />
            </linearGradient>

            <radialGradient
              id="paint0_radial_242_278"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)"
            >
              <stop offset="0.0666667" stopColor="#d4d4d4" />
              <stop offset="0.243243" stopColor="#d4d4d4" />
              <stop offset="0.43594" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }
);
BackgroundBeams.displayName = "BackgroundBeams";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default BackgroundBeams;
