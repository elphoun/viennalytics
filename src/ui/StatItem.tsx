interface StatItemProps {
  label: string;
  value: string;
  className?: string;
}

const StatItem = ({ label, value, className = "" }: StatItemProps) => {
  return (
    <div className={`flex justify-between ${className}`}>
      <p>{label}</p>
      <p className="text-orange-300">{value}</p>
    </div>
  );
};

export default StatItem;