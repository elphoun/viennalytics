import { PropsWithChildren, memo } from "react";

import Header from "../../menu/Header";
import BackgroundBeams from "../background/BackgroundBeams";
import { cn } from "../utils";

const MainContainer = memo(({ children }: PropsWithChildren) => {
  return (
    <div className={cn("min-h-screen w-screen flex flex-col items-center justify-center overflow-y-scroll")}>
      <BackgroundBeams />
      <div className={cn("w-full max-w-7xl mx-auto relative z-10 flex flex-col gap-y-5 p-5 flex-1")}>
        <Header />
        <div className={cn("flex-1 flex flex-col items-center w-full h-full min-h-0")}>
          {children}
        </div>
      </div>
    </div>
  );
});

MainContainer.displayName = "MainContainer"

export default MainContainer;
