import { ReactElement, ReactNode } from "react";

interface DataCardProps {
  title: string | ReactElement;
  children: ReactNode;
  className?: string;
}

const DataCard = ({ title, children, className = "" }: DataCardProps) => {
  return (
    <div className={`bg-white/5 px-4 py-2 rounded-lg ${className}`}>
      <h3 className="text-md font-semibold text-orange-300 mb-1">{title}</h3>
      {children}
    </div>
  );
};

export default DataCard;