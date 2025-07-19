import { PropsWithChildren, memo } from "react";

import { cn } from "../utils";

const Title = memo(({ children }: PropsWithChildren) => (
    <h1 className={cn("text-white text-3xl asul-bold mb-2")}>
        {children}
    </h1>
));

Title.displayName = "Title";

export default Title; 