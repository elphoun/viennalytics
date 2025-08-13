// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { PropsWithChildren, memo } from "react";

import { cn } from "../utils";
import BackgroundBeams from "./background/BackgroundBeams";
import Header from "./header/Header";

/**
 * MainContainer component provides the main layout structure with background and header.
 * @param children - The content to display inside the main container
 */
const MainContainer = memo(({ children }: PropsWithChildren) => (
  <div className={cn('text-white select-none overflow-y-auto scrollbar-thin')}>
    <BackgroundBeams />
    <div
      className={cn(
        "min-h-screen w-full mx-auto flex flex-col items-center justify-center",
        "relative z-10 gap-y-10 p-3 flex-1"
      )}
    >
      <Header />
      <div
        className={cn(
          "flex-1 flex flex-col items-center w-full max-w-full min-w-0 px-10 md:px-20",
          "h-full min-h-0 gap-3 sm:gap-5"
        )}
      >
        {children}
      </div>
    </div>
  </div>
));
MainContainer.displayName = "MainContainer"

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default MainContainer;
