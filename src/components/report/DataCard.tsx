import { ReactNode } from "react";

import Text from "../Text/Text";

interface DataCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const DataCard = ({ title, children, className = "" }: DataCardProps) => {
  return (
    <div className={`bg-white/5 p-6 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold text-orange-300 mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default DataCard;