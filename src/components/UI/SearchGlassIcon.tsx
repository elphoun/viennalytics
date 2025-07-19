import { memo } from "react";

import { cn } from "../utils";

const SearchGlassIcon = memo(() => (
  <svg width="24" height="24" viewBox="0 0 739 700" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("mr-2")}>
    <line y1="-30" x2="361.248" y2="-30" transform="matrix(0.757475 0.652864 -0.64138 0.767223 426.364 464.154)" stroke="currentColor" strokeWidth="60" />
    <path d="M265.151 269.23H0C0.000162436 120.539 118.712 8.37564e-05 265.151 0V269.23Z" fill="currentColor" />
    <path d="M265.152 269.231L530.303 269.231C530.303 417.923 411.591 538.461 265.152 538.462L265.152 269.231Z" fill="currentColor" />
    <path d="M265.151 269.231L265.151 538.462C118.712 538.461 0.000162475 417.923 0 269.231L265.151 269.231ZM47.7432 270.049C47.7432 388.098 143.441 483.796 261.49 483.797L261.49 270.049L47.7432 270.049Z" fill="currentColor" />
    <path d="M265.152 269.23L265.152 0C411.591 8.37361e-05 530.303 120.539 530.303 269.23L265.152 269.23ZM482.56 268.412C482.56 150.363 386.862 54.6651 268.813 54.665L268.813 268.412L482.56 268.412Z" fill="currentColor" />
  </svg>
));
SearchGlassIcon.displayName = "SearchGlassIcon";

export default SearchGlassIcon;
