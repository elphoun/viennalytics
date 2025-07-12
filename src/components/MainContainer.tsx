import { PropsWithChildren, memo } from "react";

import Header from "./Header";
import { BackgroundBeams } from "./Background";

const MainContainer = memo(({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen w-screen p-5 relative flex items-center justify-center">
      <BackgroundBeams />
      <div className="flex flex-col min-h-2xl max-w-4xl mx-auto relative z-10 gap-y-20">
        <Header />
        {children}
      </div>
    </div>
  );
});

MainContainer.displayName = "MainContainer"

export default MainContainer;
