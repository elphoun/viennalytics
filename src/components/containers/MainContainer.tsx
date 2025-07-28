// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { PropsWithChildren, memo } from "react";

import Header from "../../menu/Header";
import BackgroundBeams from "../background/BackgroundBeams";
import { cn } from "../utils";

// ─ Helper Functions ─────────────────────────────────────────────────────────────────────────────

/**
 * MainContainer component provides the main layout structure with background and header.
 * @param children - The content to display inside the main container
 */
const MainContainer = memo(({ children }: PropsWithChildren) => {
  return (
    <>
      <BackgroundBeams />
      <div className={cn(
        "min-h-screen w-full max-w-7xl mx-auto flex flex-col items-center justify-center",
        "overflow-x-hidden overflow-y-auto relative z-10 gap-y-6 lg:gap-y-10",
        "p-3 sm:p-5 flex-1"
      )}>
        <Header />
        <div className={cn(
          "flex-1 flex flex-col items-center w-full max-w-full min-w-0",
          "h-full min-h-0 gap-3 sm:gap-5"
        )}>
          {children}
        </div>
      </div>
    </>
  );
});

MainContainer.displayName = "MainContainer"

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default MainContainer;
