import { PropsWithChildren, memo } from "react";

import { cn } from "../utils";

const BigTitle = memo(({ children }: PropsWithChildren) => (
    <h1 className={cn("text-orange-400 text-5xl asul-bold mb-2 animate-pulse")}>
        {children}
    </h1>
));

BigTitle.displayName = "BigTitle";

export default BigTitle; 