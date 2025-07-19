import { ReactNode, memo } from "react";

import { cn } from "../utils";

interface ClickProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

const HeaderLink = memo(({ icon, label, onClick }: ClickProps) => {
  return (
    <button type="button" className={cn('flex items-center gap-3 text-lg font-semibold transition-all cursor-pointer duration-600 rounded-xl hover:brightness-50')} onClick={onClick}>
      <span className={cn('hidden md:block')}>{label}</span>
      {icon}
    </button>
  );
});

HeaderLink.displayName = "HeaderLink";

export default HeaderLink;