import { PropsWithChildren, memo } from "react";

import { cn } from "../utils";

const Subtitle = memo(({ children }: PropsWithChildren) => (
    <h2 className={cn("flex flex-row flex-wrap text-white text-lg courier-prime-regular")}>
        {children}
    </h2>
));

Subtitle.displayName = "Subtitle";

export default Subtitle; 