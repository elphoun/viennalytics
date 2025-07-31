// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

import { TextProps } from "../interfaces";
import { cn } from "../utils";

const BigTitle = memo(({ text, icon }: TextProps) => (
    <h1 className={cn("text-orange-400 text-5xl asul-bold mb-2 animate-pulse flex items-center gap-2")}> 
        {text}
        {icon && <span>{icon}</span>}
    </h1>
));
BigTitle.displayName = "BigTitle";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default BigTitle; 