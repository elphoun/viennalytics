import { memo, ReactNode } from "react";

import { cn } from "../../utils";

const SearchGlassIcon = memo((): ReactNode => (
  <img
    src="/searchGlass.svg"
    alt=""
    className={cn("mr-2 w-5 h-5 inline-block")}
    draggable={false}
  />
));
SearchGlassIcon.displayName = "SearchGlassIcon";

export default SearchGlassIcon;
